using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RiskService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Age = table.Column<int>(type: "INTEGER", nullable: false),
                    Location = table.Column<string>(type: "TEXT", nullable: false),
                    HealthStatus = table.Column<string>(type: "TEXT", nullable: false),
                    MedicalConditions = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RiskEvaluations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    RiskLevel = table.Column<string>(type: "TEXT", nullable: false),
                    EvaluationDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FactorsConsidered = table.Column<string>(type: "TEXT", nullable: false),
                    EnvironmentalConditions = table.Column<string>(type: "TEXT", nullable: false),
                    Recommendations = table.Column<string>(type: "TEXT", nullable: false),
                    TestResponses = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RiskEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RiskEvaluations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EnvironmentalConditions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Location = table.Column<string>(type: "TEXT", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Temperature = table.Column<double>(type: "REAL", nullable: false),
                    Humidity = table.Column<double>(type: "REAL", nullable: false),
                    AirQualityIndex = table.Column<double>(type: "REAL", nullable: false),
                    UVIndex = table.Column<double>(type: "REAL", nullable: false),
                    Precipitation = table.Column<double>(type: "REAL", nullable: false),
                    WeatherCondition = table.Column<string>(type: "TEXT", nullable: false),
                    RiskEvaluationId = table.Column<int>(type: "INTEGER", nullable: true),
                    RiskEvaluationId1 = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnvironmentalConditions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EnvironmentalConditions_RiskEvaluations_RiskEvaluationId",
                        column: x => x.RiskEvaluationId,
                        principalTable: "RiskEvaluations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EnvironmentalConditions_RiskEvaluations_RiskEvaluationId1",
                        column: x => x.RiskEvaluationId1,
                        principalTable: "RiskEvaluations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_EnvironmentalConditions_RiskEvaluationId",
                table: "EnvironmentalConditions",
                column: "RiskEvaluationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EnvironmentalConditions_RiskEvaluationId1",
                table: "EnvironmentalConditions",
                column: "RiskEvaluationId1");

            migrationBuilder.CreateIndex(
                name: "IX_RiskEvaluations_UserId",
                table: "RiskEvaluations",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EnvironmentalConditions");

            migrationBuilder.DropTable(
                name: "RiskEvaluations");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
