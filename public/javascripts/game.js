window.onload = async function() {
    try {
        music = new Audio('/assets/audio/main_theme_01.mp3');
        music.loop = true;
        music.play();
        let result = await checkGame(true);
        if (result.err) throw result.err;
    } catch (err) {
        console.log(err);
    }
}