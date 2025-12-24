import { describe, it, expect, beforeEach } from 'vitest';
import { EloCalculation } from './elo.calculation';

// Mock minimal entities to avoid TypeORM import issues
const createMockMatch = (teamData: any) => ({
    rounds: teamData.rounds || [],
} as any);

const createMockRating = (playerId: string, rating: number, uncertainty: number = 100) => ({
    player: { id: playerId },
    rating,
    uncertainty,
    nodeType: 'initial',
} as any);

const createMockConfig = (kFactor: number = 32) => ({
    parameters: {
        kFactor,
        initialRating: 1000,
        ratingDeviation: 350,
    },
    system: 'elo',
} as any);

describe('EloCalculation', () => {
    let calculator: EloCalculation;

    beforeEach(() => {
        calculator = new EloCalculation();
    });

    it('should be defined', () => {
        expect(calculator).toBeDefined();
    });

    describe('Expected Score Calculation', () => {
        it('should calculate 0.5 for equal ratings', () => {
            // Access private method via any cast for testing
            const calc = calculator as any;
            const expected = calc.calculateExpectedScore(1200, 1200);
            expect(expected).toBeCloseTo(0.5, 2);
        });

        it('should calculate higher expected score for higher rated player', () => {
            const calc = calculator as any;
            const expected = calc.calculateExpectedScore(1400, 1200);
            expect(expected).toBeGreaterThan(0.5);
            expect(expected).toBeCloseTo(0.76, 2);
        });

        it('should calculate lower expected score for lower rated player', () => {
            const calc = calculator as any;
            const expected = calc.calculateExpectedScore(1200, 1400);  
            expect(expected).toBeLessThan(0.5);
            expect(expected).toBeCloseTo(0.24, 2);
        });
    });

    describe('Uncertainty-Adjusted K-Factor', () => {
        it('should return base K when uncertainty is undefined', () => {
            const calc = calculator as any;
            const k = calc.calculateAdjustedK(32, undefined);
            expect(k).toBe(32);
        });

        it('should double K for maximum uncertainty (new players)', () => {
            const calc = calculator as any;
            const k = calc.calculateAdjustedK(32, 350); // Max uncertainty
            expect(k).toBeCloseTo(64, 1); // 32 * 2
        });

        it('should halve K for minimum uncertainty (established players)', () => {
            const calc = calculator as any;
            const k = calc.calculateAdjustedK(32, 50); // Min uncertainty
            expect(k).toBeCloseTo(16, 1); // 32 * 0.5
        });

        it('should scale K linearly with uncertainty', () => {
            const calc = calculator as any;
            const k = calc.calculateAdjustedK(32, 200); // Mid uncertainty
            expect(k).toBeGreaterThan(16);
            expect(k).toBeLessThan(64);
        });
    });

    describe('Match Calculation - 2v2 Scenario', () => {
        it('should calculate rating changes for a 2v2 match', () => {
            const match = createMockMatch({
                rounds: [
                    {
                        playerStats: [
                            { player: { id: 'p1' }, stats: { team: '0' } },
                            { player: { id: 'p2' }, stats: { team: '0' } },
                            { player: { id: 'p3' }, stats: { team: '1' } },
                            { player: { id: 'p4' }, stats: { team: '1' } },
                        ],
                        teamStats: [
                            { stats: { teamId: '0', score: 3 }, team: { id: '0' } },
                            { stats: { teamId: '1', score: 1 }, team: { id: '1' } },
                        ],
                    },
                ],
            });

            const inputRatings = [
                createMockRating('p1', 1200, 100),
                createMockRating('p2', 1180, 100),
                createMockRating('p3', 1210, 100),
                createMockRating('p4', 1190, 100),
            ];

            const config = createMockConfig(32);

            const result = calculator.calculate(match, inputRatings, config);

            // Team 0 won, should gain rating
            expect(result['p1'].rating).toBeGreaterThan(1200);
            expect(result['p2'].rating).toBeGreaterThan(1180);
            
            // Team 1 lost, should lose rating
            expect(result['p3'].rating).toBeLessThan(1210);
            expect(result['p4'].rating).toBeLessThan(1190);
        });

        it('should return unchanged ratings when match has no rounds', () => {
            const match = createMockMatch({ rounds: [] });
            const inputRatings = [createMockRating('p1', 1200, 100)];
            const config = createMockConfig(32);

            const result = calculator.calculate(match, inputRatings, config);

            // Should fallback to no change
            expect(result['p1'].rating).toBe(1200);
        });
    });

    describe('Uncertainty Decay', () => {
        it('should decay uncertainty after each match', () => {
            const match = createMockMatch({
                rounds: [
                    {
                        playerStats: [
                            { player: { id: 'p1' }, stats: { team: '0' } },
                            { player: { id: 'p2' }, stats: { team: '1' } },
                        ],
                        teamStats: [
                            { stats: { teamId: '0', score: 3 }, team: { id: '0' } },
                            { stats: { teamId: '1', score: 1 }, team: { id: '1' } },
                        ],
                    },
                ],
            });

            const inputRatings = [
                createMockRating('p1', 1200, 200),
                createMockRating('p2', 1200, 200),
            ];

            const config = createMockConfig(32);

            const result = calculator.calculate(match, inputRatings, config);

            // Uncertainty should decay by 5% (0.95 factor)
            expect(result['p1'].uncertainty).toBeLessThan(200);
            expect(result['p1'].uncertainty).toBeCloseTo(190, 0);
            expect(result['p2'].uncertainty).toBeLessThan(200);
        });

        it('should not decay uncertainty below minimum', () => {
            const match = createMockMatch({
                rounds: [
                    {
                        playerStats: [
                            { player: { id: 'p1' }, stats: { team: '0' } },
                            { player: { id: 'p2' }, stats: { team: '1' } },
                        ],
                        teamStats: [
                            { stats: { teamId: '0', score: 3 }, team: { id: '0' } },
                            { stats: { teamId: '1', score: 1 }, team: { id: '1' } },
                        ],
                    },
                ],
            });

            const inputRatings = [
                createMockRating('p1', 1200, 50),
                createMockRating('p2', 1200, 50),
            ];

            const config = createMockConfig(32);

            const result = calculator.calculate(match, inputRatings, config);

            // Should stay at minimum
            expect(result['p1'].uncertainty).toBe(50);
            expect(result['p2'].uncertainty).toBe(50);
        });
    });

    describe('Rating Change Magnitude', () => {
        it('should have larger rating changes for players with high uncertainty', () => {
            const match = createMockMatch({
                rounds: [
                    {
                        playerStats: [
                            { player: { id: 'p1' }, stats: { team: '0' } },
                            { player: { id: 'p2'}, stats: { team: '1' } },
                        ],
                        teamStats: [
                            { stats: { teamId: '0', score: 3 }, team: { id: '0' } },
                            { stats: { teamId: '1', score: 1 }, team: { id: '1' } },
                        ],
                    },
                ],
            });

            const inputRatings = [
                createMockRating('p1', 1200, 350), // High uncertainty (new player)
                createMockRating('p2', 1200, 50),   // Low uncertainty (established)
            ];

            const config = createMockConfig(32);

            const result = calculator.calculate(match, inputRatings, config);

            const p1Change = Math.abs(result['p1'].rating - 1200);
            const p2Change = Math.abs(result['p2'].rating - 1200);

            // New player (high uncertainty) should have larger rating change
            expect(p1Change).toBeGreaterThan(p2Change);
        });
    });
});
