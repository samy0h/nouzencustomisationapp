-- Add missing DeliveryType enum and Order.deliveryType column.
DO $$ BEGIN
  CREATE TYPE "DeliveryType" AS ENUM ('A_DOMICILE', 'STOP_DESK');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryType" "DeliveryType" NOT NULL DEFAULT 'A_DOMICILE';
