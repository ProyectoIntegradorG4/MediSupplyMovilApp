describe('Registro de usuarios concurrente', () => {
  const numUsers = 10;
  
  it(`Debería registrar ${numUsers} usuarios simultáneamente`, () => {
    // Array de promesas para registros simultáneos
    const registrations = Array(numUsers).fill().map((_, index) => {
      return cy.request({
        method: 'POST',
        url: 'http://localhost:8001/register',
        body: {
          email: `test${index}_${Math.random().toString(36).substring(7)}@example.com`,
          password: 'Test123!',
          firstName: `Test${index}`,
          lastName: `User${index}`
        },
        failOnStatusCode: false
      });
    });

    // Ejecuta todas las peticiones y verifica resultados
    Promise.all(registrations).then(responses => {
      const successful = responses.filter(response => response.status === 200);
      cy.log(`Registros exitosos: ${successful.length} de ${numUsers}`);
      
      responses.forEach((response, index) => {
        cy.log(`Usuario ${index + 1}: Status ${response.status}`);
      });
    });
  });
});