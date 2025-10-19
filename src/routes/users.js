import express from "express";
import { query } from "../db.js";

const router = express.Router();

function mapEmployeeToCompany(row) {
  return {
    id: row.id,
    companyName: row.company_name || `${row.first_name || ""} ${row.last_name || ""}`.trim(),
    taxId: row.tax_id || "",
    addressNumber: row.address_number || "",
    moo: row.moo || "",
    village: row.village || "",
    soi: row.soi || "",
    road: row.road || "",
    subDistrict: row.sub_district || row.city || "",
    district: row.district || row.state || "",
    province: row.province || "",
    postalCode: row.postal_code || ""
  };
}

function toNullable(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

router.get("/:id", async (req, res) => {
  const employeeId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(employeeId)) {
    return res.status(400).json({ error: "Invalid user id." });
  }

  try {
    const result = await query(
      `SELECT id, first_name, last_name, company_name, tax_id, address_number, moo, village,
              soi, road, sub_district, district, province, postal_code, city, state
         FROM employees
        WHERE id = $1`,
      [employeeId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json(mapEmployeeToCompany(result.rows[0]));
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({ error: "Unable to fetch user info." });
  }
});

router.put("/:id", async (req, res) => {
  const employeeId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(employeeId)) {
    return res.status(400).json({ error: "Invalid user id." });
  }

  const {
    companyName,
    taxId,
    addressNumber,
    moo,
    village,
    soi,
    road,
    subDistrict,
    district,
    province,
    postalCode
  } = req.body;

  try {
    const result = await query(
      `UPDATE employees
          SET company_name = $1,
              tax_id = $2,
              address_number = $3,
              moo = $4,
              village = $5,
              soi = $6,
              road = $7,
              sub_district = $8,
              district = $9,
              province = $10,
              postal_code = $11,
              updated_at = NOW()
        WHERE id = $12
        RETURNING id`,
      [
        toNullable(companyName),
        toNullable(taxId),
        toNullable(addressNumber),
        toNullable(moo),
        toNullable(village),
        toNullable(soi),
        toNullable(road),
        toNullable(subDistrict),
        toNullable(district),
        toNullable(province),
        toNullable(postalCode),
        employeeId
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({ message: "User info updated." });
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).json({ error: "Unable to update user info." });
  }
});

export default router;
