const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

(async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting the server:", error);
    }
});