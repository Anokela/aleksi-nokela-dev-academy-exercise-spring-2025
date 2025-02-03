describe("Home-page", () => {
    it("Navigate to Home-page, wait for 3 seconds and verify that connection to database works", () => {
      cy.visit("/");
      cy.contains("Electricity Statistics").should("be.visible");
      cy.wait(3000); // wait 3 seconds
      cy.contains("Failed to load electricity data.").should("not.exist");
    });
  });