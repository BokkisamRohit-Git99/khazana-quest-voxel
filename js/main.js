window.onload = async () => {
    // 1. Initialize CrazyGames SDK v3
    await cgManager.initSDK();

    // 2. Instantiate Three.js Engine & UI Modules
    window.threeStage = new ThreeStage();
    window.uiOverlay = new UIOverlay();

    // 3. Render Initial Sidebar Tab
    window.uiOverlay.render('upgrades');

    // 4. Fire Gameplay Start Event (Fixes CrazyGames Audit Warning)
    cgManager.notifyGameplayStart();

    // 5. Request Responsive Banner Placement
    cgManager.requestBanner('banner-ad-bottom');
};