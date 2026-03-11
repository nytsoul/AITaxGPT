export function Footer() {
  return (
    <footer className="mt-0 py-6 bg-sidebar text-sidebar-foreground/60 text-center text-sm border-t border-sidebar-border">
      <div className="max-w-[1680px] mx-auto px-4 lg:px-8">
        <p className="font-medium">© 2026 TaxGPT. All rights reserved.</p>
        <p className="mt-2 flex justify-center gap-4">
          <a href="#" className="hover:text-sidebar-foreground transition-colors">
            Privacy Policy
          </a>
          <span className="text-sidebar-border">|</span>
          <a href="#" className="hover:text-sidebar-foreground transition-colors">
            Terms of Service
          </a>
        </p>
      </div>
    </footer>
  );
}
