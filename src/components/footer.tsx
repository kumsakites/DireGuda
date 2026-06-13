import { Mail, Phone, MapPin } from "lucide-react";

const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/kumsa-kitessa-2b3300232/",
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
  {
    label: "Facebook",
    href: "https://web.facebook.com/kumsa.kitessa/",
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
  },
  {
    label: "Telegram",
    href: "https://t.me/kumsakitessa",
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/kumsakitessa?igsh=MXR3bWVodGRveXc5MQ==",
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>,
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-sidebar/40 backdrop-blur-sm px-6 py-10 text-sm text-muted-foreground">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="space-y-3">
          <p className="font-semibold text-foreground text-base">Location</p>
          <a href="https://www.google.com/maps/search/Bole,+Addis+Ababa,+Ethiopia"
            target="_blank" rel="noopener noreferrer"
            className="flex items-start gap-2 hover:text-primary transition-colors">
            <MapPin size={15} className="mt-0.5 shrink-0" />
            Bole, Addis Ababa, Ethiopia
          </a>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-foreground text-base">Contact</p>
          <a href="mailto:kumsakitessa12@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Mail size={15} /> kumsakitessa12@gmail.com
          </a>
          <a href="tel:+251917534343" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Phone size={15} /> +251 917 534 343
          </a>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-foreground text-base">Follow Us</p>
          <div className="flex gap-4">
            {socials.map(({ label, href, svg }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="hover:text-primary hover:scale-110 transition-all">
                {svg}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 pt-6 flex flex-col sm:flex-row justify-between gap-2 opacity-70">
        <span>All Rights Reserved © 2026 Kumsa Kitessa.</span>
        <span>Developed by Kumsa Kitessa</span>
      </div>
    </footer>
  );
}
