export interface TranslationDictionary {
    common: {
        unexpectedError: string;
        maintenanceMode: string;
        cooldownRemaining: string;
        notRegistered: string;
        targetNotRegistered: string;
        unauthorized: string;
        success: string;
        expiredInteraction: string;
        databaseError: string;
        databaseErrorTitle: string;
    };
    api: {
        serviceUnavailable: string;
        serviceUnavailableTitle: string;
        rateLimited: string;
        invalidToken: string;
        connectionError: string;
        notFound: string;
        malAuthError: string;
        malTokenRefreshFailed: string;
    };
    ui: {
        loading: string;
        claimButton: string;
        rewardButton: string;
        wishlistButton: string;
        confirmTrade: string;
        acceptTrade: string;
        tradeCompletedTitle: string;
        pageInfo: string;
        serverAverage: string;
        noCharacters: string;
        charactersOf: string;
        belongsTo: string;
        favorites: string;
        claims: string;
        wishedBy: string;
        gender: string;
        age: string;
        bloodType: string;
        noScores: string;
        tradeConfirmDesc: string;
        tradeAcceptTitle: string;
        tradeAcceptDesc: string;
        tradeFinishDesc: string;
        tradeNotClaimedError: string;
    };
    gacha: {
        outOfPulls: string;
        outOfPullsResetInfo: string;
        outOfClaims: string;
        outOfClaimsResetInfo: string;
        claimedBy: string;
        alreadyOwnedReward: string;
        insufficientRenas: string;
        pullsPurchased: string;
        claimsPurchased: string;
        tradeSelfError: string;
        characterNotFound: string;
        renasGained: string;
    };
    affinity: {
        selfAffinityError: string;
        calculatedSuccess: string;
        affinityResult: string;
    };
    setup: {
        instructionsTitle: string;
        instructionsFooter: string;
        instructionsBody: string;
        successDesc: string;
    };
    settings: {
        showScoresEnabled: string;
        showScoresDisabled: string;
    };
    media: {
        nobodyKnows: string;
        noVotesVn: string;
    };
}
