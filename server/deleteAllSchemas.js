const mongoose = require("mongoose");

async function deleteAllSchemas() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/incident-db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Delete all models from mongoose.models
    for (const modelName in mongoose.models) {
      delete mongoose.models[modelName];
      console.log(`Deleted model: ${modelName}`);
    }

    // Optionally, delete all schemas from mongoose.modelSchemas
    for (const schemaName in mongoose.modelSchemas) {
      delete mongoose.modelSchemas[schemaName];
      console.log(`Deleted schema: ${schemaName}`);
    }

    console.log("All schemas and models have been deleted.");
  } catch (error) {
    console.error("Error deleting schemas and models:", error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

deleteAllSchemas();
