window.onload = async () => {
    // Initialize CrazyGames SDK v3
    await cgManager.initSDK();

    // Instantiating 3D Engine & UI Overlay Modules
    window.threeStage = new ThreeStage();
    window.uiOverlay = new UIOverlay();

    // Initial Sidebar Rendering
    window.uiOverlay.render('upgrades');

    // Request Responsive Banner Ad in safe zone
    cgManager.requestBanner('banner-ad-bottom');
};