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

    // --- CrazyGames Gameplay Lifecycle Events ---

    notifyGameplayStart() {
        if (this.sdk && this.sdk.game) {
            try {
                this.sdk.game.gameplayStart();
                console.log("CrazyGames SDK: gameplayStart() fired successfully.");
            } catch (e) {
                console.warn("gameplayStart error:", e);
            }
        }
    }

    notifyGameplayStop() {
        if (this.sdk && this.sdk.game) {
            try {
                this.sdk.game.gameplayStop();
                console.log("CrazyGames SDK: gameplayStop() fired successfully.");
            } catch (e) {
                console.warn("gameplayStop error:", e);
            }
        }
    }

    // --- CrazyGames Cloud Save Data Module ---

    async saveData(key, dataObject) {
        const jsonString = JSON.stringify(dataObject);

        if (this.sdk && this.sdk.data) {
            try {
                await this.sdk.data.setItem(key, jsonString);
                console.log("Progress successfully saved to CrazyGames Cloud!");
                return;
            } catch (e) {
                console.warn("Cloud save failed, falling back to localStorage:", e);
            }
        }

        try {
            localStorage.setItem(key, jsonString);
        } catch (e) {
            console.warn("LocalStorage save error:", e);
        }
    }

    async loadData(key) {
        let rawData = null;

        if (this.sdk && this.sdk.data) {
            try {
                rawData = await this.sdk.data.getItem(key);
            } catch (e) {
                console.warn("Cloud load error, checking localStorage:", e);
            }
        }

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

        return null;
    }

    // --- Ad & Audio Management ---

    showRewardedAd(onSuccess, onFailure) {
        if (!this.isOnline) {
            alert("No internet connection available. Connect to claim your reward!");
            if (onFailure) onFailure("offline");
            return;
        }

        if (!this.sdk) {
            onSuccess(); // Mock fallback for local dev
            return;
        }

        this.sdk.ad.requestAd('rewarded', {
            adStarted: () => {
                if (window.threeStage) window.threeStage.pauseAudio();
            },
            adFinished: () => {
                if (window.threeStage) window.threeStage.resumeAudio();
                onSuccess();
            },
            adError: (error) => {
                if (window.threeStage) window.threeStage.resumeAudio();
                console.warn("Rewarded ad failed or was dismissed:", error);
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
            adStarted: () => {
                if (window.threeStage) window.threeStage.pauseAudio();
            },
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
            try {
                this.sdk.banner.requestResponsiveBanner([containerId]);
            } catch (e) {
                console.warn("Banner Request Error:", e);
            }
        }
    }
}

const cgManager = new CrazyGamesManager();