"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Todos",
      [
        {
          title: "todo1",
          description: "try get method",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "todo2",
          description: "try post method",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "todo3",
          description: "try put method",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Todos", null, {});
  },
};
