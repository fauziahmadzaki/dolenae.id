/**
 * Ilustrasi gunung (garis) untuk panel media login — sesuai aset Figma
 * `lucide:mountain-snow` (dua gunung + aksen salju).
 */
export function MountainScene({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="0 0 140 140"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* gunung besar di belakang kanan */}
      <path d="M52 116 78 68l56 48" />
      {/* gunung depan kiri */}
      <path d="M4 116 44 48l22 40" />
      {/* aksen salju puncak depan */}
      <path d="M35 65l9-17 10 18" />
    </svg>
  );
}
