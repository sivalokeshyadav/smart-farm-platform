from fastapi import APIRouter, HTTPException, status
from app.schemas.calculator import (
    LandConversionRequest, LandConversionResponse,
    SeedFertilizerCalcRequest, YieldMarginCalcRequest,
    CalculatorResultResponse,
    GpsLandAreaRequest, GpsLandAreaResponse
)
from app.services.calculator_service import calculator_service

router = APIRouter(prefix="/calculators", tags=["Land & Farm Calculators"])

@router.post("/land-convert", response_model=LandConversionResponse)
async def convert_land_units(data: LandConversionRequest):
    try:
        return calculator_service.convert_land(value=data.value, from_unit=data.fromUnit)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/gps-land-area", response_model=GpsLandAreaResponse)
async def calculate_gps_land_area(data: GpsLandAreaRequest):
    try:
        return calculator_service.calculate_gps_land(
            coordinates=data.coordinates,
            fence_pole_spacing_feet=data.fencePoleSpacingFeet,
            fence_wire_strands=data.fenceWireStrands
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/seed-fertilizer", response_model=CalculatorResultResponse)
async def calculate_seed_fertilizer(data: SeedFertilizerCalcRequest):
    return calculator_service.calculate_seed_fertilizer(
        crop=data.crop,
        acres=data.acres,
        farming_method=data.farmingMethod
    )

@router.post("/yield-margin", response_model=CalculatorResultResponse)
async def calculate_yield_margin(data: YieldMarginCalcRequest):
    return calculator_service.calculate_yield_margin(
        crop=data.crop,
        acres=data.acres,
        expected_yield_per_acre_quintals=data.expectedYieldPerAcreQuintals,
        expected_price_per_quintal=data.expectedPricePerQuintal,
        seed_cost_per_acre=data.seedCostPerAcre,
        fertilizer_pesticide_cost_per_acre=data.fertilizerPesticideCostPerAcre,
        labor_machinery_cost_per_acre=data.laborMachineryCostPerAcre,
        irrigation_cost_per_acre=data.irrigationCostPerAcre,
        other_cost_per_acre=data.otherCostPerAcre
    )

