# Tana Market - Roles & Permissions System

This document outlines the role-based access control (RBAC) system implemented in the Tana Market application.

## Overview

The application defines three primary user roles:
1.  **Admin** (`admin`)
2.  **Manager** (`manager`)
3.  **Customer** (`customer`)

## Role Definitions & Permissions

### 1. Admin (`admin`)
The Super User of the system with full access to all resources.

*   **Access Level**: Critical / Full
*   **Capabilities**:
    *   **User Management**: Create, edit, delete, and view all users (admins, managers, customers).
    *   **Product Management**: Full CRUD (Create, Read, Update, Delete) on products.
    *   **Order Management**: View and manage all orders.
    *   **Reports & Analytics**: Access strictly sensitive sales and performance reports.
    *   **System Settings**: Configure global application settings.
    *   **Activity Logs**: View audit trails of all system actions.

### 2. Manager (`manager`)
Operational staff responsible for day-to-day store management.

*   **Access Level**: High / Operational
*   **Capabilities**:
    *   **Product Management**: Create, Update, and View products. (Cannot Delete products).
    *   **Order Management**: Process orders, update shipping status.
    *   **Customer Support**: Reply to customer messages and comments.
    *   **Refunds**: Handle return requests.
    *   *Restriction*: No access to sensitive user data, system settings, or deleting critical records.

### 3. Customer (`customer`)
The end-user of the e-commerce platform.

*   **Access Level**: Standard / Public
*   **Capabilities**:
    *   **Shopping**: Browse products, add to cart, checkout.
    *   **Profile**: Manage own profile, view own order history.
    *   **Interactions**: Rate products, leave comments.
    *   *Restriction*: Access limited strictly to own data and public resources.

## Dashboard Menu Structure

The dashboard dynamically adjusts based on the logged-in user's role:

| Menu Item | Admin | Manager | Customer |
| :--- | :---: | :---: | :---: |
| **Dashboard** | ✅ | ✅ | ✅ |
| **Analytics (Reports)** | ✅ | ✅ | ❌ |
| **Products (CRUD)** | ✅ | ✅ | ❌ |
| **Orders (All)** | ✅ | ✅ | ❌ |
| **Users (Manage)** | ✅ | ❌ | ❌ |
| **Activity Logs** | ✅ | ❌ | ❌ |
| **My Orders** | ❌ | ❌ | ✅ |
| **Settings** | ✅ | ✅ | ✅ |

## Implementation Details

*   **Frontend**: `DashboardLayout.tsx` conditionally renders menu items using `user.role`.
*   **Backend**: Middleware (`protect`, `authorize`) in Express routes ensures API security.
    *   `protect`: Verifies valid JWT token.
    *   `authorize('admin')`: Restricts route to Admin only.

## Best Practices for Expansion

*   **Least Privilege**: Always assign the lowest possible role to a user.
*   **Audit Trails**: Critical actions (like `delete`) are logged to `ActivityLog`.
*   **Role Scalability**: New roles (e.g., `Support Agent`) can be added by extending the `User` model `enum` and updating the `authorize` middleware.
