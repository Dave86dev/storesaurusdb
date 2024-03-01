import express from 'express';
import config from '../config';
import { initDbConnection } from './db'; 

const app = express();
const PORT = config.port;

app.use(express.json());

const startServer = async () => {
    try {
        await initDbConnection();   
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
    }
};

startServer();
