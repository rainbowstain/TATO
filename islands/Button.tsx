export default function Button({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      class="text-white hover:text-red-500 transition-colors cursor-pointer"
    >
      {children}
    </a>
  );
}
