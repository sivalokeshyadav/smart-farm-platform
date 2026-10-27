import math
from typing import Dict, Any, List, Union


# Regional Land Conversions (Standardized to Square Metres)
SQ_METERS_PER_UNIT = {
    "sq_meters": 1.0,
    "sq_feet": 0.09290304,
    "acres": 4046.8564224,
    "hectares": 10000.0,
    "cents": 40.468564224,     # 1 Acre = 100 Cents (AP/Rayalaseema standard)
    "guntas": 101.17141056     # 1 Acre = 40 Guntas
}

CROP_AGRONOMIC_NORMS = {
    "Paddy": {
        "seedKgPerAcre": {"Traditional": 25.0, "Direct Seeded": 15.0, "SRI": 2.5},
        "nitrogenKgPerAcre": 48.0,
        "phosphorusKgPerAcre": 24.0,
        "potashKgPerAcre": 24.0,
        "waterMmPerSeason": 1200.0,
        "avgYieldQuintalsPerAcre": 24.0
    },
    "Cotton": {
        "seedKgPerAcre": {"Traditional": 2.0, "Direct Seeded": 1.8, "SRI": 1.5},
        "nitrogenKgPerAcre": 40.0,
        "phosphorusKgPerAcre": 20.0,
        "potashKgPerAcre": 20.0,
        "waterMmPerSeason": 700.0,
        "avgYieldQuintalsPerAcre": 10.0
    },
    "Groundnut": {
        "seedKgPerAcre": {"Traditional": 55.0, "Direct Seeded": 50.0, "SRI": 45.0},
        "nitrogenKgPerAcre": 10.0,
        "phosphorusKgPerAcre": 20.0,
        "potashKgPerAcre": 20.0,
        "waterMmPerSeason": 500.0,
        "avgYieldQuintalsPerAcre": 12.0
    },
    "Chili": {
        "seedKgPerAcre": {"Traditional": 1.0, "Direct Seeded": 0.8, "SRI": 0.6},
        "nitrogenKgPerAcre": 60.0,
        "phosphorusKgPerAcre": 30.0,
        "potashKgPerAcre": 30.0,
        "waterMmPerSeason": 800.0,
        "avgYieldQuintalsPerAcre": 18.0
    },
    "Bengal Gram": {
        "seedKgPerAcre": {"Traditional": 30.0, "Direct Seeded": 25.0, "SRI": 20.0},
        "nitrogenKgPerAcre": 8.0,
        "phosphorusKgPerAcre": 16.0,
        "potashKgPerAcre": 0.0,
        "waterMmPerSeason": 350.0,
        "avgYieldQuintalsPerAcre": 8.0
    },
    "Maize": {
        "seedKgPerAcre": {"Traditional": 8.0, "Direct Seeded": 7.5, "SRI": 6.0},
        "nitrogenKgPerAcre": 48.0,
        "phosphorusKgPerAcre": 24.0,
        "potashKgPerAcre": 20.0,
        "waterMmPerSeason": 550.0,
        "avgYieldQuintalsPerAcre": 28.0
    }
}

class CalculatorService:
    @staticmethod
    def convert_land(value: float, from_unit: str) -> Dict[str, Any]:
        unit_key = from_unit.lower().strip()
        if unit_key not in SQ_METERS_PER_UNIT:
            raise ValueError(f"Unknown unit '{from_unit}'. Supported: {list(SQ_METERS_PER_UNIT.keys())}")
        
        # Convert to base sq_meters
        sq_meters = value * SQ_METERS_PER_UNIT[unit_key]

        conversions = {
            unit: round(sq_meters / factor, 4)
            for unit, factor in SQ_METERS_PER_UNIT.items()
        }

        return {
            "originalValue": value,
            "originalUnit": unit_key,
            "conversions": conversions,
            "regionalNotes": (
                "In Kurnool and Andhra Pradesh: 1 Acre = 100 Cents = 40 Guntas = 43,560 sq ft. "
                "Cents are predominantly used in revenue records."
            )
        }

    @staticmethod
    def calculate_seed_fertilizer(crop: str, acres: float, farming_method: str = "Traditional") -> Dict[str, Any]:
        norm = CROP_AGRONOMIC_NORMS.get(crop, CROP_AGRONOMIC_NORMS["Paddy"])
        method_rates = norm["seedKgPerAcre"]
        seed_rate = method_rates.get(farming_method, method_rates["Traditional"])
        
        total_seed_kg = round(seed_rate * acres, 2)
        urea_bags = round((norm["nitrogenKgPerAcre"] / 0.46 / 45.0) * acres, 1) # 45kg bag of Urea (46% N)
        dap_bags = round((norm["phosphorusKgPerAcre"] / 0.46 / 50.0) * acres, 1) # 50kg bag of DAP (46% P2O5)
        mop_bags = round((norm["potashKgPerAcre"] / 0.60 / 50.0) * acres, 1) if norm["potashKgPerAcre"] > 0 else 0.0

        return {
            "title": f"Seed & Nutrient Requirement for {crop} ({acres} acres)",
            "parameters": {
                "crop": crop,
                "acres": acres,
                "farmingMethod": farming_method
            },
            "formulaUsed": "Standard ANGRAU (Acharya N.G. Ranga Agricultural University) recommended dosage",
            "metrics": {
                "recommendedSeedKg": total_seed_kg,
                "seedRatePerAcre": seed_rate,
                "estimatedUreaBags45Kg": urea_bags,
                "estimatedDAPBags50Kg": dap_bags,
                "estimatedMOPBags50Kg": mop_bags,
                "waterMmPerSeason": norm["waterMmPerSeason"]
            },
            "disclaimer": "Dosage recommendations are general benchmarks. Soil test report from your local Rythu Bharosa Kendra (RBK) takes precedence."
        }

    @staticmethod
    def calculate_yield_margin(
        crop: str,
        acres: float,
        expected_yield_per_acre_quintals: float,
        expected_price_per_quintal: float,
        seed_cost_per_acre: float,
        fertilizer_pesticide_cost_per_acre: float,
        labor_machinery_cost_per_acre: float,
        irrigation_cost_per_acre: float,
        other_cost_per_acre: float = 0.0
    ) -> Dict[str, Any]:
        total_yield_quintals = round(expected_yield_per_acre_quintals * acres, 2)
        gross_revenue = round(total_yield_quintals * expected_price_per_quintal, 2)
        
        cost_per_acre = (
            seed_cost_per_acre +
            fertilizer_pesticide_cost_per_acre +
            labor_machinery_cost_per_acre +
            irrigation_cost_per_acre +
            other_cost_per_acre
        )
        total_cost = round(cost_per_acre * acres, 2)
        net_profit = round(gross_revenue - total_cost, 2)
        
        # Break-even calculations to avoid division by zero
        cost_of_production_per_quintal = round(total_cost / total_yield_quintals, 2) if total_yield_quintals > 0 else 0.0
        breakeven_yield_quintals = round(total_cost / expected_price_per_quintal, 2) if expected_price_per_quintal > 0 else 0.0
        profit_margin_percent = round((net_profit / gross_revenue) * 100, 2) if gross_revenue > 0 else 0.0

        return {
            "title": f"Gross Margin & Break-even Analysis for {crop}",
            "parameters": {
                "acres": acres,
                "expectedYieldPerAcreQuintals": expected_yield_per_acre_quintals,
                "expectedPricePerQuintal": expected_price_per_quintal,
                "costPerAcre": cost_per_acre
            },
            "formulaUsed": "Gross Revenue = Total Quintals * Price; Net Margin = Revenue - Total Production Cost",
            "metrics": {
                "totalEstimatedYieldQuintals": total_yield_quintals,
                "grossRevenueRs": gross_revenue,
                "totalInputCostRs": total_cost,
                "netProfitOrLossRs": net_profit,
                "profitMarginPercent": profit_margin_percent,
                "costOfProductionPerQuintalRs": cost_of_production_per_quintal,
                "breakevenYieldQuintals": breakeven_yield_quintals
            },
            "disclaimer": "Market commodity prices fluctuate at Kurnool AMC. Weather and pest pressures may impact actual realized yields."
        }

    @staticmethod
    def calculate_gps_land(
        coordinates: list,
        fence_pole_spacing_feet: float = 10.0,
        fence_wire_strands: int = 4
    ) -> Dict[str, Any]:
        n = len(coordinates)
        if n < 3:
            raise ValueError("At least 3 boundary GPS coordinates are required to calculate field area.")

        # Extract lat/lon list
        coords_list = []
        for c in coordinates:
            lat = c.latitude if hasattr(c, 'latitude') else c['latitude']
            lon = c.longitude if hasattr(c, 'longitude') else c['longitude']
            coords_list.append((float(lat), float(lon)))

        # Mean latitude and longitude for equirectangular projection
        avg_lat = sum(lat for lat, _ in coords_list) / n
        avg_lon = sum(lon for _, lon in coords_list) / n
        lat0_rad = math.radians(avg_lat)
        R = 6371008.8  # Earth mean radius in meters

        # Project coordinates onto local metric plane (meters)
        pts_xy = []
        for lat, lon in coords_list:
            x = R * math.radians(lon - avg_lon) * math.cos(lat0_rad)
            y = R * math.radians(lat - avg_lat)
            pts_xy.append((x, y))

        # Shoelace formula for polygon area in square meters
        area_sq_m = 0.0
        for i in range(n):
            j = (i + 1) % n
            area_sq_m += pts_xy[i][0] * pts_xy[j][1] - pts_xy[j][0] * pts_xy[i][1]
        area_sq_m = abs(area_sq_m) / 2.0

        # Haversine distance helper
        def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
            phi1, phi2 = math.radians(lat1), math.radians(lat2)
            dphi = math.radians(lat2 - lat1)
            dlam = math.radians(lon2 - lon1)
            a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2.0)**2
            c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
            return R * c

        # Compute perimeter and individual edge lengths
        edges = []
        perimeter_m = 0.0
        for i in range(n):
            j = (i + 1) % n
            lat1, lon1 = coords_list[i]
            lat2, lon2 = coords_list[j]
            d_m = haversine(lat1, lon1, lat2, lon2)
            perimeter_m += d_m
            edges.append({
                "fromPoint": i + 1,
                "toPoint": j + 1,
                "distanceMeters": round(d_m, 2),
                "distanceFeet": round(d_m * 3.28084, 2)
            })

        perimeter_ft = perimeter_m * 3.28084
        pole_spacing_ft = max(5.0, float(fence_pole_spacing_feet))
        wire_strands = max(1, min(10, int(fence_wire_strands)))

        # Fencing estimates
        total_poles = max(n, math.ceil(perimeter_ft / pole_spacing_ft))
        total_wire_m = perimeter_m * wire_strands
        standard_wire_roll_m = 400.0  # standard 400-meter barbed/solar wire reel
        rolls_estimated = round(total_wire_m / standard_wire_roll_m, 2)

        # Conversions to regional agricultural units
        area_acres = area_sq_m / SQ_METERS_PER_UNIT["acres"]
        area_cents = area_acres * 100.0
        area_guntas = area_acres * 40.0
        area_hectares = area_sq_m / SQ_METERS_PER_UNIT["hectares"]
        area_sq_ft = area_sq_m / SQ_METERS_PER_UNIT["sq_feet"]
        area_sq_yards = area_sq_ft / 9.0

        regional_summary = (
            f"Field Survey: {round(area_acres, 3)} Acres ({round(area_cents, 1)} Cents / "
            f"{round(area_guntas, 1)} Guntas). Perimeter: {round(perimeter_m, 1)} m ({round(perimeter_ft, 1)} ft). "
            f"Fencing requires ~{total_poles} boundary poles and {rolls_estimated} wire rolls ({wire_strands} strands)."
        )

        return {
            "totalPoints": n,
            "areaSqMeters": round(area_sq_m, 2),
            "areaAcres": round(area_acres, 4),
            "areaCents": round(area_cents, 2),
            "areaGuntas": round(area_guntas, 2),
            "areaHectares": round(area_hectares, 4),
            "areaSqFeet": round(area_sq_ft, 2),
            "areaSqYards": round(area_sq_yards, 2),
            "perimeterMeters": round(perimeter_m, 2),
            "perimeterFeet": round(perimeter_ft, 2),
            "edges": edges,
            "centroid": {"latitude": round(avg_lat, 6), "longitude": round(avg_lon, 6)},
            "fencing": {
                "perimeterMeters": round(perimeter_m, 2),
                "perimeterFeet": round(perimeter_ft, 2),
                "poleSpacingFeet": pole_spacing_ft,
                "wireStrands": wire_strands,
                "totalPolesNeeded": total_poles,
                "cornerPoles": n,
                "totalWireLengthMeters": round(total_wire_m, 2),
                "wireRollsEstimated": rolls_estimated
            },
            "regionalSummary": regional_summary
        }

calculator_service = CalculatorService()

