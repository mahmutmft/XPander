const calculateLevel = (xp) => {
    // Formula: level = 1 + floor(sqrt(xp/100))
    return Math.floor(1 + Math.sqrt(xp / 100));
};

const calculateXpForLevel = (level) => {
    // Formula: xp = 100 * (level-1)^2
    return 100 * Math.pow(level - 1, 2);
};

const calculateXpNeeded = (currentXp) => {
    const currentLevel = calculateLevel(currentXp);
    const nextLevelXp = calculateXpForLevel(currentLevel + 1);
    return nextLevelXp - currentXp;
};

module.exports = {
    calculateLevel,
    calculateXpForLevel,
    calculateXpNeeded
}; 