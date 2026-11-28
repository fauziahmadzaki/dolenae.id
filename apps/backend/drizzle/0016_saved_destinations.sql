CREATE TABLE IF NOT EXISTS "saved_destinations" (
	"user_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_destinations_user_id_destination_id_pk" PRIMARY KEY("user_id","destination_id")
);
--> statement-breakpoint
DO $$
DECLARE
	schema_name text := current_schema();
	tbl_oid oid := to_regclass(format('%I.saved_destinations', schema_name));
	users_oid oid := to_regclass(format('%I.users', schema_name));
	destinations_oid oid := to_regclass(format('%I.destinations', schema_name));
	col_type text;
	has_saved_at boolean;
	has_created_at boolean;
	null_count bigint;
	dup_count bigint;
	rec record;
	fk_spec record;
	fk_row record;
	has_target_pk boolean;
	fk_def_ok boolean;
BEGIN
	IF tbl_oid IS NULL THEN
		RAISE EXCEPTION 'Tabel saved_destinations tidak ditemukan pada schema %', schema_name;
	END IF;
	IF users_oid IS NULL OR destinations_oid IS NULL THEN
		RAISE EXCEPTION 'Tabel rujukan users/destinations tidak ditemukan pada schema %', schema_name;
	END IF;

	-- 1. Normalisasi saved_at -> created_at (timestamptz NOT NULL DEFAULT now()).
	SELECT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = schema_name AND table_name = 'saved_destinations' AND column_name = 'saved_at'
	) INTO has_saved_at;
	SELECT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = schema_name AND table_name = 'saved_destinations' AND column_name = 'created_at'
	) INTO has_created_at;

	IF has_saved_at AND NOT has_created_at THEN
		EXECUTE format('ALTER TABLE %I.saved_destinations RENAME COLUMN "saved_at" TO "created_at"', schema_name);
	ELSIF NOT has_created_at THEN
		EXECUTE format('ALTER TABLE %I.saved_destinations ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL', schema_name);
	END IF;

	EXECUTE format('UPDATE %I.saved_destinations SET "created_at" = now() WHERE "created_at" IS NULL', schema_name);

	SELECT data_type INTO col_type
	FROM information_schema.columns
	WHERE table_schema = schema_name AND table_name = 'saved_destinations' AND column_name = 'created_at';

	IF col_type IS DISTINCT FROM 'timestamp with time zone' THEN
		EXECUTE format(
			'ALTER TABLE %I.saved_destinations ALTER COLUMN "created_at" TYPE timestamp with time zone USING ("created_at" AT TIME ZONE ''UTC'')',
			schema_name
		);
	END IF;

	EXECUTE format(
		'ALTER TABLE %I.saved_destinations ALTER COLUMN "created_at" SET DEFAULT now(), ALTER COLUMN "created_at" SET NOT NULL',
		schema_name
	);

	-- 2. Deteksi data invalid sebelum perubahan destruktif pada PK/kolom legacy.
	EXECUTE format(
		'SELECT COUNT(*) FROM %I.saved_destinations WHERE "user_id" IS NULL OR "destination_id" IS NULL',
		schema_name
	) INTO null_count;
	IF null_count > 0 THEN
		RAISE EXCEPTION 'Ditemukan % baris saved_destinations dengan user_id atau destination_id NULL', null_count;
	END IF;

	EXECUTE format(
		'SELECT COUNT(*) FROM (SELECT "user_id", "destination_id" FROM %I.saved_destinations GROUP BY "user_id", "destination_id" HAVING COUNT(*) > 1) AS dups',
		schema_name
	) INTO dup_count;
	IF dup_count > 0 THEN
		RAISE EXCEPTION 'Ditemukan % pasangan duplikat (user_id, destination_id) pada saved_destinations', dup_count;
	END IF;

	-- 3. Inspeksi pg_constraint aktual: drop PK legacy yang bukan target & UNIQUE redundant.
	FOR rec IN
		SELECT
			c.conname,
			c.contype,
			(
				SELECT array_agg(a.attname::text ORDER BY k.ord)
				FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
				JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
			) AS ordered_cols,
			(
				SELECT array_agg(a.attname::text ORDER BY a.attname)
				FROM unnest(c.conkey) AS k(attnum)
				JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
			) AS sorted_cols
		FROM pg_constraint c
		WHERE c.conrelid = tbl_oid
			AND c.contype IN ('p', 'u')
	LOOP
		IF rec.contype = 'p' AND (
			rec.conname <> 'saved_destinations_user_id_destination_id_pk'
			OR rec.ordered_cols IS DISTINCT FROM ARRAY['user_id', 'destination_id']
		) THEN
			EXECUTE format('ALTER TABLE %I.saved_destinations DROP CONSTRAINT %I', schema_name, rec.conname);
		ELSIF rec.contype = 'u' AND rec.sorted_cols = ARRAY['destination_id', 'user_id'] THEN
			EXECUTE format('ALTER TABLE %I.saved_destinations DROP CONSTRAINT %I', schema_name, rec.conname);
		END IF;
	END LOOP;

	-- 4. Hapus kolom legacy id jika masih ada, kunci NOT NULL, dan pasang PK komposit.
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = schema_name AND table_name = 'saved_destinations' AND column_name = 'id'
	) THEN
		EXECUTE format('ALTER TABLE %I.saved_destinations DROP COLUMN "id"', schema_name);
	END IF;

	EXECUTE format(
		'ALTER TABLE %I.saved_destinations ALTER COLUMN "user_id" SET NOT NULL, ALTER COLUMN "destination_id" SET NOT NULL',
		schema_name
	);

	SELECT EXISTS (
		SELECT 1 FROM pg_constraint c
		WHERE c.conrelid = tbl_oid
			AND c.contype = 'p'
			AND c.conname = 'saved_destinations_user_id_destination_id_pk'
	) INTO has_target_pk;

	IF NOT has_target_pk THEN
		EXECUTE format(
			'ALTER TABLE %I.saved_destinations ADD CONSTRAINT "saved_destinations_user_id_destination_id_pk" PRIMARY KEY("user_id","destination_id")',
			schema_name
		);
	END IF;

	-- 5. Hapus FK legacy lain pada kolom user_id / destination_id, lalu inspeksi & perbaiki kedua FK target.
	FOR rec IN
		SELECT
			c.conname,
			(
				SELECT array_agg(a.attname::text ORDER BY k.ord)
				FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
				JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
			) AS src_cols
		FROM pg_constraint c
		WHERE c.conrelid = tbl_oid
			AND c.contype = 'f'
			AND c.conname NOT IN (
				'saved_destinations_user_id_users_id_fk',
				'saved_destinations_destination_id_destinations_id_fk'
			)
	LOOP
		IF rec.src_cols = ARRAY['user_id'] OR rec.src_cols = ARRAY['destination_id'] THEN
			EXECUTE format('ALTER TABLE %I.saved_destinations DROP CONSTRAINT %I', schema_name, rec.conname);
		END IF;
	END LOOP;

	FOR fk_spec IN
		SELECT * FROM (
			VALUES
				('saved_destinations_user_id_users_id_fk', 'user_id', users_oid, 'users', 'id'),
				('saved_destinations_destination_id_destinations_id_fk', 'destination_id', destinations_oid, 'destinations', 'id')
		) AS t(conname, src_col, ref_oid, ref_table, ref_col)
	LOOP
		SELECT
			c.contype,
			c.confrelid,
			c.confdeltype,
			c.confupdtype,
			c.convalidated,
			(
				SELECT array_agg(a.attname::text ORDER BY k.ord)
				FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
				JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
			) AS src_cols,
			(
				SELECT array_agg(a.attname::text ORDER BY k.ord)
				FROM unnest(c.confkey) WITH ORDINALITY AS k(attnum, ord)
				JOIN pg_attribute a ON a.attrelid = c.confrelid AND a.attnum = k.attnum
			) AS ref_cols
		INTO fk_row
		FROM pg_constraint c
		WHERE c.conrelid = tbl_oid
			AND c.conname = fk_spec.conname;

		IF NOT FOUND THEN
			EXECUTE format(
				'ALTER TABLE %I.saved_destinations ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE cascade ON UPDATE no action',
				schema_name,
				fk_spec.conname,
				fk_spec.src_col,
				schema_name,
				fk_spec.ref_table,
				fk_spec.ref_col
			);
		ELSE
			fk_def_ok :=
				fk_row.contype = 'f'
				AND fk_row.confrelid = fk_spec.ref_oid
				AND fk_row.confdeltype = 'c'
				AND fk_row.confupdtype = 'a'
				AND fk_row.src_cols = ARRAY[fk_spec.src_col]
				AND fk_row.ref_cols = ARRAY[fk_spec.ref_col];

			IF fk_def_ok AND NOT fk_row.convalidated THEN
				EXECUTE format(
					'ALTER TABLE %I.saved_destinations VALIDATE CONSTRAINT %I',
					schema_name,
					fk_spec.conname
				);
			ELSIF NOT fk_def_ok THEN
				EXECUTE format(
					'ALTER TABLE %I.saved_destinations DROP CONSTRAINT %I',
					schema_name,
					fk_spec.conname
				);
				EXECUTE format(
					'ALTER TABLE %I.saved_destinations ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE cascade ON UPDATE no action',
					schema_name,
					fk_spec.conname,
					fk_spec.src_col,
					schema_name,
					fk_spec.ref_table,
					fk_spec.ref_col
				);
			END IF;
		END IF;
	END LOOP;
END $$;
--> statement-breakpoint
DO $$
DECLARE
	schema_name text := current_schema();
	tbl_oid oid := to_regclass(format('%I.saved_destinations', schema_name));
	idx_row record;
	idx_def_ok boolean := false;
	bound_to_constraint boolean := false;
BEGIN
	SELECT
		ic.oid AS index_oid,
		i.indrelid,
		am.amname,
		i.indisvalid,
		i.indisready,
		i.indisunique,
		i.indpred,
		i.indexprs,
		i.indnatts,
		i.indnkeyatts,
		i.indoption::text AS indopts,
		(
			SELECT array_agg(a.attname::text ORDER BY k.ord)
			FROM unnest(i.indkey::int2[]) WITH ORDINALITY AS k(attnum, ord)
			JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.attnum
		) AS idx_cols
	INTO idx_row
	FROM pg_class ic
	JOIN pg_namespace ns ON ns.oid = ic.relnamespace
	JOIN pg_index i ON i.indexrelid = ic.oid
	JOIN pg_am am ON am.oid = ic.relam
	WHERE ns.nspname = schema_name
		AND ic.relname = 'saved_destinations_user_created_idx';

	IF FOUND THEN
		IF idx_row.indrelid <> tbl_oid THEN
			RAISE EXCEPTION 'Indeks saved_destinations_user_created_idx pada schema % menempel pada tabel lain (%)', schema_name, idx_row.indrelid;
		END IF;

		idx_def_ok :=
			idx_row.amname = 'btree'
			AND idx_row.indisvalid
			AND idx_row.indisready
			AND NOT idx_row.indisunique
			AND idx_row.indpred IS NULL
			AND idx_row.indexprs IS NULL
			AND idx_row.indnatts = 2
			AND idx_row.indnkeyatts = 2
			AND idx_row.idx_cols = ARRAY['user_id', 'created_at']
			AND idx_row.indopts = '0 0';

		IF NOT idx_def_ok THEN
			SELECT EXISTS (
				SELECT 1 FROM pg_constraint c WHERE c.conindid = idx_row.index_oid
			) INTO bound_to_constraint;
			IF bound_to_constraint THEN
				RAISE EXCEPTION 'Indeks saved_destinations_user_created_idx terikat constraint dan tidak dapat diganti otomatis';
			END IF;
			EXECUTE format('DROP INDEX %I.%I', schema_name, 'saved_destinations_user_created_idx');
			EXECUTE format(
				'CREATE INDEX "saved_destinations_user_created_idx" ON %I.saved_destinations USING btree ("user_id","created_at")',
				schema_name
			);
		END IF;
	ELSE
		EXECUTE format(
			'CREATE INDEX "saved_destinations_user_created_idx" ON %I.saved_destinations USING btree ("user_id","created_at")',
			schema_name
		);
	END IF;
END $$;
--> statement-breakpoint
DO $$
DECLARE
	schema_name text := current_schema();
	tbl_oid oid := to_regclass(format('%I.saved_destinations', schema_name));
	users_oid oid := to_regclass(format('%I.users', schema_name));
	destinations_oid oid := to_regclass(format('%I.destinations', schema_name));
	pk_cols text[];
	fk_spec record;
	fk_ok boolean;
	idx_ok boolean;
	col_ok boolean;
BEGIN
	SELECT (
		SELECT array_agg(a.attname::text ORDER BY k.ord)
		FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
		JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
	)
	INTO pk_cols
	FROM pg_constraint c
	WHERE c.conrelid = tbl_oid
		AND c.contype = 'p'
		AND c.conname = 'saved_destinations_user_id_destination_id_pk';

	IF pk_cols IS DISTINCT FROM ARRAY['user_id', 'destination_id'] THEN
		RAISE EXCEPTION 'Verifikasi migrasi 0016 gagal: PK komposit tidak valid (%)', pk_cols;
	END IF;

	FOR fk_spec IN
		SELECT * FROM (
			VALUES
				('saved_destinations_user_id_users_id_fk', 'user_id', users_oid, 'id'),
				('saved_destinations_destination_id_destinations_id_fk', 'destination_id', destinations_oid, 'id')
		) AS t(conname, src_col, ref_oid, ref_col)
	LOOP
		SELECT EXISTS (
			SELECT 1
			FROM pg_constraint c
			WHERE c.conrelid = tbl_oid
				AND c.conname = fk_spec.conname
				AND c.contype = 'f'
				AND c.confrelid = fk_spec.ref_oid
				AND c.confdeltype = 'c'
				AND c.confupdtype = 'a'
				AND c.convalidated = true
				AND (
					SELECT array_agg(a.attname::text ORDER BY k.ord)
					FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
					JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
				) = ARRAY[fk_spec.src_col]
				AND (
					SELECT array_agg(a.attname::text ORDER BY k.ord)
					FROM unnest(c.confkey) WITH ORDINALITY AS k(attnum, ord)
					JOIN pg_attribute a ON a.attrelid = c.confrelid AND a.attnum = k.attnum
				) = ARRAY[fk_spec.ref_col]
		) INTO fk_ok;

		IF NOT fk_ok THEN
			RAISE EXCEPTION 'Verifikasi migrasi 0016 gagal: definisi FK % tidak valid', fk_spec.conname;
		END IF;
	END LOOP;

	SELECT EXISTS (
		SELECT 1
		FROM pg_class ic
		JOIN pg_namespace ns ON ns.oid = ic.relnamespace
		JOIN pg_index i ON i.indexrelid = ic.oid
		JOIN pg_am am ON am.oid = ic.relam
		WHERE ns.nspname = schema_name
			AND ic.relname = 'saved_destinations_user_created_idx'
			AND i.indrelid = tbl_oid
			AND am.amname = 'btree'
			AND i.indisvalid
			AND i.indisready
			AND NOT i.indisunique
			AND i.indpred IS NULL
			AND i.indexprs IS NULL
			AND i.indnatts = 2
			AND i.indnkeyatts = 2
			AND i.indoption::text = '0 0'
			AND (
				SELECT array_agg(a.attname::text ORDER BY k.ord)
				FROM unnest(i.indkey::int2[]) WITH ORDINALITY AS k(attnum, ord)
				JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.attnum
			) = ARRAY['user_id', 'created_at']
	) INTO idx_ok;

	IF NOT idx_ok THEN
		RAISE EXCEPTION 'Verifikasi migrasi 0016 gagal: definisi indeks saved_destinations_user_created_idx tidak valid';
	END IF;

	SELECT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = schema_name
			AND table_name = 'saved_destinations'
			AND column_name = 'created_at'
			AND data_type = 'timestamp with time zone'
			AND is_nullable = 'NO'
			AND column_default IS NOT NULL
	) INTO col_ok;

	IF NOT col_ok THEN
		RAISE EXCEPTION 'Verifikasi migrasi 0016 gagal: kolom created_at tidak sesuai spesifikasi';
	END IF;
END $$;
