import { Button } from "@/components/ui/button";
import { Vote, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { label: "Voting Guide", href: "#voting" },
    { label: "Candidate Profiles", href: "#candidates" },
    { label: "Election News", href: "#news" },
    { label: "About Us", href: "#about" }
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
    { label: "Cookie Policy", href: "#cookies" },
    { label: "Accessibility", href: "#accessibility" }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#facebook", label: "Facebook" },
    { icon: Twitter, href: "#twitter", label: "Twitter" },
    { icon: Instagram, href: "#instagram", label: "Instagram" }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <Vote className="w-5 h-5 text-secondary-foreground" />
              </div>
              <span className="text-xl font-bold">VoteInfo Nigeria</span>
            </div>
            
            <p className="text-primary-foreground/80 leading-relaxed">
              Empowering Nigerian voters with reliable information to make informed democratic choices.
            </p>

            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary-foreground/10 text-primary-foreground hover:text-secondary-light"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-secondary-light transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-secondary-light transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-primary-foreground/80">
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@voteinfo.ng</span>
              </div>
              <div className="flex items-center space-x-3 text-primary-foreground/80">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+234 800 VOTE INFO</span>
              </div>
              <div className="flex items-center space-x-3 text-primary-foreground/80">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Abuja, Nigeria</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-primary-foreground/80 text-sm text-center md:text-left">
              © 2024 VoteInfo Nigeria. All rights reserved. Made with ❤️ for Nigerian democracy.
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-primary-foreground/80">
              <span>Powered by civic engagement</span>
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span>Non-partisan platform</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;