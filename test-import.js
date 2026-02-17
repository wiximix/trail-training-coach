const { calculateElevationLossCoefficient, DEFAULT_ELEVATION_LOSS_COEFFICIENT } = require('./src/lib/trailAlgorithm.ts');
console.log('DEFAULT_ELEVATION_LOSS_COEFFICIENT:', DEFAULT_ELEVATION_LOSS_COEFFICIENT);
console.log('calculateElevationLossCoefficient(20):', calculateElevationLossCoefficient(20));
console.log('calculateElevationLossCoefficient(0):', calculateElevationLossCoefficient(0));
console.log('calculateElevationLossCoefficient(-10):', calculateElevationLossCoefficient(-10));
