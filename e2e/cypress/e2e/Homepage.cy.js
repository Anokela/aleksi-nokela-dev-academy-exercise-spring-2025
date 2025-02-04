describe("Home-page", () => {
    beforeEach(() => {
      cy.visit("/"); // Open Home-page before each test
    });
    it("Navigate to Home-page, wait for 3 seconds and verify that connection to database works", () => {
      cy.contains("Electricity Statistics").should("be.visible");
      cy.wait(3000); // wait 3 seconds
      cy.contains("Failed to load electricity data.").should("not.exist");
    });
    it("Navigate to Home-page load all data and verify data", () => {
      cy.contains("Electricity Statistics").should("be.visible");
      cy.wait(3000); // wait 3 seconds
      cy.get("#date-link-2024-09-29").should("not.exist");
      cy.get("#loadAllButton").should("be.visible");
      cy.get("#loadAllButton").click();
      cy.wait(1000);
      cy.get("#loadAllButton").should("not.exist");
      cy.get("#loadInitialDataButton").should("be.visible");
      cy.get("#date-link-2024-09-29").should("be.visible");
    });
    it("Navigate to Home-page load all data and verify data", () => {
      cy.contains("Electricity Statistics").should("be.visible");
      cy.wait(3000); // wait 3 seconds
      cy.get("#date-link-2024-09-29").should("not.exist");
      cy.get("#loadAllButton").should("be.visible");
      cy.get("#loadAllButton").click();
      cy.wait(1000);
      cy.get("#loadAllButton").should("not.exist");
      cy.get("#loadInitialDataButton").should("be.visible");
      cy.get("#date-link-2024-09-29").should("be.visible");
    });
    it("Navigate to Home-page click all data and search date 2024-02-02", () => {
      cy.contains("Electricity Statistics").should("be.visible");
      cy.wait(3000); // wait 3 seconds
      cy.get("#date-link-2024-02-02").should("not.exist");
      cy.get("#date-link-2020-12-31").should("be.visible");
      cy.get("#loadAllButton").should("be.visible");
      cy.get("#loadAllButton").click();
      cy.wait(1000);
      cy.get("#loadAllButton").should("not.exist");
      cy.get("#loadInitialDataButton").should("be.visible");
      cy.get("#date-link-2020-12-31").should("be.visible");
      cy.get("#date-link-2024-02-02").should("be.visible");
      cy.get("#searchDataInput").click();
      cy.get("#searchDataInput").type("2024-02-02");
      cy.wait(1000);
      cy.get("#date-link-2024-02-02").should("be.visible");
      cy.get("#date-link-2020-12-31").should("not.exist");
    });
  });