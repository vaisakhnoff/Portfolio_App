export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} Portfolio. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm text-text-muted">
          <a href="#" className="hover:text-accent-gold transition-colors">Twitter</a>
          <a href="#" className="hover:text-accent-gold transition-colors">GitHub</a>
          <a href="#" className="hover:text-accent-gold transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
