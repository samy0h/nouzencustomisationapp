# Nouzen Clothes Backend API

Backend API for Nouzen Clothes e-commerce platform built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

### Installation

1. **Install dependencies**
```bash
cd server
npm install
```

2. **Setup PostgreSQL Database**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nouzen_db;

# Exit psql
\q
```

3. **Configure Environment Variables**
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your database credentials
# Update DATABASE_URL with your PostgreSQL username/password
```

4. **Run Database Migrations**
```bash
npm run db:generate    # Generate Prisma Client
npm run db:migrate     # Create database tables
```

5. **Seed Database**
```bash
npm run db:seed        # Populate with 6 sample products
```

6. **Start Development Server**
```bash
npm run dev            # Start with hot reload
```

The API will be available at: `http://localhost:3001`

## 📋 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and timestamp.

**Response:**
```json
{
  "status": "success",
  "message": "Nouzen Clothes API is running",
  "timestamp": "2026-01-27T12:00:00.000Z"
}
```

### Products

#### Get All Products
```
GET /api/products
```

**Query Parameters:**
- `category` (string, optional) - Filter by category slug
- `featured` (boolean, optional) - Filter featured products
- `active` (boolean, optional) - Filter active/inactive products
- `limit` (number, optional) - Number of products per page (default: 50)
- `offset` (number, optional) - Pagination offset (default: 0)

**Examples:**
```bash
# Get all products
GET /api/products

# Get featured products only
GET /api/products?featured=true

# Get products in T-Shirt category
GET /api/products?category=tshirt

# Pagination
GET /api/products?limit=10&offset=0
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "T-shirt standard",
        "slug": "tshirt-standard",
        "description": "Classic comfortable t-shirt",
        "price": 2200,
        "images": ["url"],
        "active": true,
        "featured": true,
        "category": {
          "id": "uuid",
          "name": "T-Shirt",
          "slug": "tshirt"
        },
        "variants": [
          {
            "id": "uuid",
            "color": "Black",
            "colorHex": "#000000",
            "size": "M",
            "priceOverride": null,
            "stock": 100,
            "available": true
          }
        ],
        "createdAt": "2026-01-27T12:00:00.000Z",
        "updatedAt": "2026-01-27T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 6,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### Get Single Product
```
GET /api/products/:slug
```

**Example:**
```bash
GET /api/products/tshirt-standard
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "product": {
      "id": "uuid",
      "name": "T-shirt standard",
      "slug": "tshirt-standard",
      "description": "Classic comfortable t-shirt",
      "price": 2200,
      "images": ["url"],
      "active": true,
      "featured": true,
      "category": { ... },
      "variants": [ ... ],
      "createdAt": "2026-01-27T12:00:00.000Z",
      "updatedAt": "2026-01-27T12:00:00.000Z"
    }
  }
}
```

**Error Response (404):**
```json
{
  "status": "error",
  "message": "Product not found"
}
```

## 📊 Database Schema

### Models

**Category**
- Organizes products into categories
- Fields: id, name, slug, timestamps

**Product**
- Main product information
- Fields: id, name, slug, description, price, images[], active, featured, categoryId, timestamps
- Relations: belongs to Category, has many ProductVariants

**ProductVariant**
- Product variations (color/size combinations)
- Fields: id, productId, color, colorHex, size, priceOverride, stock, available, sku, timestamps
- Unique constraint on (productId, color, size)

**Order**
- Customer orders
- Fields: id, orderNumber, customer info, shipping address, status, total, timestamps
- Status: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED

**OrderItem**
- Individual items in an order
- Preserves product/variant data at time of order
- Fields: id, orderId, productId, variantId, preserved product info, quantity, price, customizationData (JSON), timestamp

**Design**
- Saved product customizations
- Fields: id, productId, variantId, designData (JSON), previewUrl, timestamps

**Admin**
- Admin user accounts
- Fields: id, email, passwordHash, name, role, active, timestamps

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production server
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Create/update database migrations
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio (database GUI)
```

### Project Structure

```
server/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── src/
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── index.ts           # Application entry point
├── dist/                  # Compiled JavaScript (generated)
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nouzen_db?schema=public"

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Database Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Example:**
```
postgresql://postgres:mypassword@localhost:5432/nouzen_db?schema=public
```

## 🧪 Testing Endpoints

### Using curl

```bash
# Health check
curl http://localhost:3001/api/health

# Get all products
curl http://localhost:3001/api/products

# Get featured products
curl http://localhost:3001/api/products?featured=true

# Get single product
curl http://localhost:3001/api/products/tshirt-standard

# Get products by category
curl http://localhost:3001/api/products?category=hoodie
```

### Using Prisma Studio

```bash
npm run db:studio
```

Opens a web interface at `http://localhost:5555` to view and edit database records.

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   # Windows
   services.msc  # Look for PostgreSQL service
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Verify DATABASE_URL in `.env`
3. Check PostgreSQL is listening on port 5432
4. Verify database user has correct permissions

### Migration Issues

**Error:** `Database does not exist`

**Solution:**
```bash
# Create database manually
psql -U postgres -c "CREATE DATABASE nouzen_db;"
```

**Error:** `Migration failed`

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npm run db:push --force-reset
npm run db:seed
```

## 📦 Dependencies

### Production
- `@prisma/client` - Prisma ORM client
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `zod` - Schema validation

### Development
- `typescript` - TypeScript compiler
- `prisma` - Prisma CLI
- `tsx` - TypeScript execution
- `@types/*` - TypeScript type definitions

## 🔐 Security Notes

- Never commit `.env` file to version control
- Use strong database passwords
- Enable SSL for production database connections
- Implement rate limiting for production
- Add authentication/authorization before deploying

## 📝 Next Steps

1. ✅ Backend setup complete
2. ⏳ Connect frontend to API
3. ⏳ Implement authentication
4. ⏳ Add order management endpoints
5. ⏳ Integrate payment processing
6. ⏳ Setup image storage
7. ⏳ Build admin panel API

## 🆘 Support

For issues or questions:
1. Check this README
2. Review error logs in terminal
3. Check Prisma documentation: https://www.prisma.io/docs
4. Check Express documentation: https://expressjs.com

---

**Last Updated:** 2026-01-27  
**Version:** 1.0.0  
**Status:** Backend Foundation Complete ✅
