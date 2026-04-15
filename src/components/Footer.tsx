export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} Vaisakh N. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm text-text-muted">
          <a href="https://www.instagram.com/ysakh.n/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-gold transition-colors">Instagram</a>
          <a href="https://github.com/vaisakhnoff" target="_blank" rel="noopener noreferrer" className="hover:text-accent-gold transition-colors">GitHub</a>
          <a href="https://www.linkedin.com/in/vaisakhn-/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-gold transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
