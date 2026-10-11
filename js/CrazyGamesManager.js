class CrazyGamesManager {
    constructor() {
        this.sdk = null;
        this.isOnline = navigator.onLine;

        window.addEventListener('online', () => this.handleNetworkChange(true));
        window.addEventListener('offline', () => this.handleNetworkChange(false));
    }

    async initSDK() {
        try {
            if (window.CrazyGames && window.CrazyGames.SDK) {
                this.sdk = window.CrazyGames.SDK;
                await this.sdk.init();
                console.log("CrazyGames SDK v3 Initialized successfully.");
            }
        } catch (e) {
            console.warn("Running in local development mock mode.");
        }
    }

    handleNetworkChange(status) {
        this.isOnline = status;
        console.log(`Network connection: ${status ? 'Online' : 'Offline'}`);
    }

    // --- CrazyGames Cloud Save & Local Fallback Methods ---

    async saveData(key, dataObject) {
        const jsonString = JSON.stringify(dataObject);

        // 1. Try CrazyGames Cloud Data SDK if available (syncs across devices)
        if (this.sdk && this.sdk.data) {
            try {
                await this.sdk.data.setItem(key, jsonString);
                console.log("Progress successfully saved to CrazyGames Cloud!");
                return;
            } catch (e) {
                console.warn("Cloud save failed, falling back to localStorage:", e);
            }
        }

        // 2. Local fallback for development / offline mode
        try {
            localStorage.setItem(key, jsonString);
        } catch (e) {
            console.warn("LocalStorage save error:", e);
        }
    }

    async loadData(key) {
        let rawData = null;

        // 1. Try CrazyGames Cloud Data SDK first
        if (this.sdk && this.sdk.data) {
            try {
                rawData = await this.sdk.data.getItem(key);
            } catch (e) {
                console.warn("Cloud load error, checking localStorage:", e);
            }
        }

        // 2. Fallback to localStorage if cloud returns nothing
        if (!rawData) {
            rawData = localStorage.getItem(key);
        }

        if (rawData) {
            try {
                return JSON.parse(rawData);
            } catch (e) {
                console.warn("Failed to parse saved data JSON:", e);
            }
        }

        return null; // Return null if no save exists yet
    }

    // --- Ad & Banner Methods ---

    showRewardedAd(onSuccess, onFailure) {
        if (!this.isOnline) {
            alert("No internet connection available. Connect to claim your reward!");
            if (onFailure) onFailure("offline");
            return;
        }

        if (!this.sdk) {
            onSuccess(); // Local fallback for development testing
            return;
        }

        this.sdk.ad.requestAd('rewarded', {
            adStarted: () => { if (window.threeStage) window.threeStage.pauseAudio(); },
            adFinished: () => {
                if (window.threeStage) window.threeStage.resumeAudio();
                onSuccess();
            },
            adError: (error) => {
                if (window.threeStage) window.threeStage.resumeAudio();
                if (onFailure) onFailure(error);
            }
        });
    }

    showMidgameAd(onComplete) {
        if (!this.isOnline || !this.sdk) {
            if (onComplete) onComplete();
            return;
        }

        this.sdk.ad.requestAd('midgame', {
            adStarted: () => { if (window.threeStage) window.threeStage.pauseAudio(); },
            adFinished: () => {
                if (window.threeStage) window.threeStage.resumeAudio();
                if (onComplete) onComplete();
            },
            adError: () => {
                if (window.threeStage) window.threeStage.resumeAudio();
                if (onComplete) onComplete();
            }
        });
    }

    requestBanner(containerId) {
        if (this.sdk && this.isOnline) {
            try { this.sdk.banner.requestResponsiveBanner([containerId]); } catch (e) { }
        }
    }
}

const cgManager = new CrazyGamesManager();