const fs = require('fs');
const file = 'src/components/layout.jsx';
let content = fs.readFileSync(file, 'utf8');

const search = '<Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-makini-clay" onClick={toggleMobileMenu}>';
const replace = `<Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden text-white hover:bg-makini-clay"
                            onClick={toggleMobileMenu}
                            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                            aria-expanded={isMobileMenuOpen}
                        >`;

content = content.replace(search, replace);
fs.writeFileSync(file, content);
console.log('Patched layout.jsx');
