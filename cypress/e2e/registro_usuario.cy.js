describe('Registro de Usuario', () => {
  // Función para obtener el timestamp en formato AAMMDDHHMMSS
  const getTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}`;
  };

  it('debería registrar un nuevo usuario correctamente', () => {
    const timestamp = getTimestamp();
    // Visitar la página principal y esperar a que cargue
    cy.visit('http://localhost:8081', { timeout: 30000 })
    
    // Esperar a que la aplicación esté completamente cargada
    cy.get('#root', { timeout: 30000 })
      .should('exist')
      .should('be.visible')
      
    // Esperar a que desaparezca cualquier loader si existe
    cy.wait(2000)
      
    // Esperar y hacer click en el botón de crear cuenta
    cy.contains('Crear cuenta', { timeout: 30000 })
      .should('exist')
      .should('be.visible')
      .click({ force: true })

    cy.screenshot(`registro_usuario/${timestamp}/01-ingreso`, { capture: 'viewport' })

    // Verificar que estamos en la página de registro
    cy.url().should('include', '/auth/register')

    // Generar un número aleatorio para el correo
    const randomNum = Math.floor(Math.random() * 10000)

    // Llenar el formulario usando placeholders
    cy.get('input[placeholder="Nombre completo"]').type('John Doe')
    cy.get('input[placeholder="Correo electrónico"]').eq(1)
      .should('be.visible')
      .should('be.enabled')
      .type(`correo${randomNum}@uniandes.edu.co`)
    cy.get('input[placeholder="NIT - Número Identificación Tributario"]').type('123456789')
    cy.get('input[placeholder="Contraseña"]').eq(1)
      .should('be.visible')
      .should('be.enabled')
      .type('Universidad4+')

    // Esperar un momento antes de enviar el formulario
    cy.wait(1000)

    // Tomar captura de pantalla antes de enviar el formulario
    cy.screenshot(`registro_usuario/${timestamp}/02-antes-de-enviar`, { capture: 'viewport' })

    // Enviar el formulario usando el div que actúa como botón
    cy.get('div.css-text-146c3p1').contains('Crear cuenta').click({ force: true })

    // Esperar un momento para asegurar que la navegación ocurra
    cy.wait(2000)

    // Esperar un momento adicional para cualquier redirección
    cy.wait(1000)

    // Tomar captura final
    cy.screenshot(`registro_usuario/${timestamp}/03-resultado-final`, { capture: 'viewport' })
  })
})