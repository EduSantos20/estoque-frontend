import { FaInstagram, FaWhatsapp, FaLinkedin } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="app-footer">
      <span>Desenvolvido por Eduardo Santos</span>
      <div className="social-links">
        <a href="https://www.instagram.com/eduaardosaantos" target="_blank" rel="noopener noreferrer" title="Instagram">
          <FaInstagram />
        </a>
        <a href="https://wa.me/5535992131330" target="_blank" rel="noopener noreferrer" title="WhatsApp">
          <FaWhatsapp />
        </a>
        <a href="https://www.linkedin.com/in/eduaardo-saantos/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
          <FaLinkedin />
        </a>
      </div>
    </footer>
  )
}
