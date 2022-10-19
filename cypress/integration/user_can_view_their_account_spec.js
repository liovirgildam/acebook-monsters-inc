describe("Account Page", () => {
  it("can view their account page when signed in", () => {
    // sign up
    cy.visit("/users/new");
    cy.get("#name").type("name");
    cy.get("#email").type("someone1@example.com");
    cy.get("#password1").type("Password@1");
    cy.get("#password2").type("Password@1");
    cy.get("#submit").click();

    //nav bar
    cy.contains("#logout", "Logout");
    cy.get("#account").click();

    //account page
    cy.contains("h1", "My Account");
    cy.contains("#account-name", "name");

    //view account
    cy.contains("#logout", "Logout");
  });

  it("can edit their account page when signed in", () => {
    // sign up
    cy.visit("/users/new");
    cy.get("#name").type("name");
    cy.get("#email").type("someone2@example.com");
    cy.get("#password1").type("Password@1");
    cy.get("#password2").type("Password@1");
    cy.get("#submit").click();

    //nav bar
    cy.contains("#logout", "Logout");
    cy.get("#account").click();

    //account page
    cy.get("#image-selector").selectFile("public/images/fb-evil-creator.jpg");
    cy.get("#submit").click();

    //view account
    cy.contains("#logout", "Logout");
  });
});