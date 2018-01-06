import { Router } from 'express';
import apiRoutes from './api';


const routes = Router();

// add the api routes
routes.use('/api', apiRoutes);


export default routes;
