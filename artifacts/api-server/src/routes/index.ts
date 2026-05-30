import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tenantsRouter from "./tenants";
import usersRouter from "./users";
import assetsRouter from "./assets";
import sessionsRouter from "./sessions";
import productsRouter from "./products";
import ordersRouter from "./orders";
import qrRouter from "./qr";
import paymentsRouter from "./payments";
import shiftsRouter from "./shifts";
import inventoryRouter from "./inventory";
import dashboardRouter from "./dashboard";
import auditRouter from "./audit";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tenantsRouter);
router.use(usersRouter);
router.use(assetsRouter);
router.use(sessionsRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(qrRouter);
router.use(paymentsRouter);
router.use(shiftsRouter);
router.use(inventoryRouter);
router.use(dashboardRouter);
router.use(auditRouter);

export default router;
