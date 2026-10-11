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

    showRewardedAd(onSuccess, onFailure) {
        if (!this.isOnline) {
            alert("No internet connection available. Connect to claim your reward!");
            if (onFailure) onFailure("offline");
            return;
        }

        if (!this.sdk) {
            console.warn("Mock Mode: Rewarded Ad granted.");
            onSuccess();
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