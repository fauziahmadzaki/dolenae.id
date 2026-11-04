// Run: node src/features/auth/components/login-form.test.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { transformSync } = require("next/dist/build/swc");

let focused;
const submit = () => {};
const form = {
  watch: () => true,
  formState: { errors: {} },
  register: () => ({}),
  setFocus: (field) => { focused = field; },
};
const exportsObject = {};
const jsx = (type, props) => ({ type, props });
vm.runInNewContext(transformSync(
  fs.readFileSync(`${__dirname}/login-form.tsx`, "utf8"),
  { filename: "login-form.tsx", jsc: { parser: { syntax: "typescript", tsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" } },
).code, {
  exports: exportsObject,
  require: (name) => {
    if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
    if (name === "react") return { useState: () => [false, () => {}] };
    if (name === "../hooks/use-login-form") return { useLoginForm: () => ({ form, onSubmit: submit, isSubmitting: false }) };
    if (name === "~/components/ui/toaster") return { useToast: () => ({ toast: () => {} }) };
    if (name === "~/lib/cn") return { cn: () => "" };
    return {};
  },
});
function find(node, predicate) {
  if (!node || typeof node !== "object") return;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = find(child, predicate);
    if (found) return found;
  }
}
const tree = exportsObject.LoginForm();
const email = find(tree, (node) => node.props?.id === "email");
assert.equal(typeof email.props.onKeyDown, "function", "Email needs Enter-to-next behavior");
let prevented = false;
email.props.onKeyDown({ key: "Enter", nativeEvent: { isComposing: false }, preventDefault: () => { prevented = true; } });
assert.equal(prevented, true);
assert.equal(focused, "password");
focused = undefined;
email.props.onKeyDown({ key: "Tab", nativeEvent: {}, preventDefault: () => assert.fail("Tab must stay native") });
email.props.onKeyDown({ key: "Enter", nativeEvent: { isComposing: true }, preventDefault: () => assert.fail("Do not interrupt composition") });
assert.equal(focused, undefined);
assert.equal(find(tree, (node) => node.type === "form").props.onSubmit, submit);
assert.equal(find(tree, (node) => node.props?.id === "password").props.onKeyDown, undefined);
assert.ok(find(tree, (node) => node.props?.type === "submit"));
console.log("PASS: Email Enter focuses password; password keeps native submit; Tab/composition unchanged.");
