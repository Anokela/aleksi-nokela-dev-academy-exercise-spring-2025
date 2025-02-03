describe("Load data", () => {
    it("Navigate to Home-page load all data and verify data", () => {
      cy.visit("/");
      cy.contains("Electricity Statistics").should("be.visible");
      cy.wait(3000); // wait 3 seconds
      cy.get("#date-link-2024-09-29").should("not.exist");
      cy.get("#loadAllButton").should("be.visible");
      cy.get("#loadAllButton").click();
      cy.wait(1000)
      cy.get("#date-link-2024-09-29").should("be.visible");
      //cy.contains("Dashboard").click();
      //cy.contains("Lataa").click();
      
    });
  });
  