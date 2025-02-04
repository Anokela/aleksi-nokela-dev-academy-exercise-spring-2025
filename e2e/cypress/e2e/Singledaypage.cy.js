describe("Singledaypage", () => {
    beforeEach(() => {
      cy.visit("/"); // Open Home-page before each test
    });
    it("Load all data and verify navigation to single day page 2024-09-29 ", () => {
      cy.contains("Electricity Statistics").should("be.visible");
      cy.wait(3000); // wait 3 seconds
      cy.get("#date-link-2024-09-29").should("not.exist");
      cy.get("#loadAllButton").should("be.visible");
      cy.get("#backHomeButton").should("not.exist");
      cy.get("#loadAllButton").click();
      cy.wait(1000)
      cy.get("#date-link-2024-09-29").should("be.visible");
      cy.get("#date-link-2024-09-29").click();
      cy.contains("Electricity Statistics for 2024-09-29").should("be.visible");
      cy.contains("Hourly Electricity Data").should("be.visible");
      cy.contains("Peak Consumption Hour: 09:00").should("be.visible");
      cy.contains("Cheapest Hours: 14:00, 15:00, 13:00").should("be.visible");
      cy.get("#loadAllButton").should("not.exist");
      cy.get("#backHomeButton").should("be.visible");
    });

    it("Load all data, navigate to single day page 2024-09-29 and navigate back to homepage ", () => {
      cy.contains("Electricity Statistics").should("be.visible");
      cy.wait(3000); // wait 3 seconds
      cy.get("#date-link-2024-09-29").should("not.exist");
      cy.get("#loadAllButton").should("be.visible");
      cy.get("#backHomeButton").should("not.exist");
      cy.get("#loadAllButton").click();
      cy.wait(1000);
      cy.get("#date-link-2024-09-29").should("be.visible");
      cy.get("#date-link-2024-09-29").click();
      cy.wait(1000);
      cy.get("#date-link-2024-09-29").should("not.exist");
      cy.contains("Electricity Statistics for 2024-09-29").should("be.visible");
      cy.contains("Hourly Electricity Data").should("be.visible");
      cy.contains("Peak Consumption Hour: 09:00").should("be.visible");
      cy.contains("Cheapest Hours: 14:00, 15:00, 13:00").should("be.visible");
      cy.get("#loadAllButton").should("not.exist");
      cy.get("#loadInitialDataButton").should("not.exist");
      cy.get("#backHomeButton").should("be.visible");
      cy.get("#backHomeButton").click();
      cy.wait(2000);
      cy.contains("Electricity Statistics for 2024-09-29").should("not.exist");
      cy.contains("Hourly Electricity Data").should("not.exist");
      cy.contains("Peak Consumption Hour: 09:00").should("not.exist");
      cy.contains("Cheapest Hours: 14:00, 15:00, 13:00").should("not.exist");
      cy.get("#date-link-2024-09-29").should("be.visible");
      cy.get("#loadInitialDataButton").should("be.visible");
      cy.get("#backHomeButton").should("not.exist");
    });
  });
  