import React from 'react';

class Pong extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            screenH: 720,
            screenW: 1280,

            playerH: 180,
            playerW: 30,
            playerX: 50,
            playerY: 100,
            playerS: 10,
            aiX: 1230,
            aiY: 100,
            

            ballWH: 30,
            ballInit: {
                x: 640,
                y: 360,
            },
            ballX: 640,
            ballY: 360,
            ballS: 5,
            ballDir: {
                x: -1,
                y: -1,
            },

            keys: {
                up: 0,
                down: 0,
            },

            score: {
                player: 0,
                AI: 0,
            },
            scoreX: 200,
            scoreY: 100,
            scoreFont: "60px Consolas",
        }
    }

    componentDidMount() {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext('2d');

        this.interval = setInterval(() => this.fixedUpdate(ctx), 16.666667);
        document.addEventListener("keydown", this.keyDown.bind(this), false);
        document.addEventListener("keyup", this.keyUp.bind(this), false);
    }

    keyUp(e){
        let key = e.keyCode;
        if (key === 38){
            this.setState({
                keys: {
                    up: 0,
                    down: this.state.keys.down,
                },
            })
        }

        if (key === 40){
            this.setState({
                keys: {
                    up: this.state.keys.up,
                    down: 0,
                },
            })
        }
    }

    keyDown(e){
        let key = e.keyCode;
        if (key === 38){
            this.setState({
                keys: {
                    up: 1,
                    down: this.state.keys.down,
                },
            })
        }

        if (key === 40){
            this.setState({
                keys: {
                    up: this.state.keys.up,
                    down: 1,
                },
            })
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        document.removeEventListener("keydown", this.keyDown, false);
        document.removeEventListener("keyup", this.keyUp, false);
    }

    fixedUpdate(ctx) {
        this.draw(ctx);
        this.moveBall();
        this.movePlayer();
        this.moveAI();
        this.ballScreenColision();
        this.ballPlayerCollision();
        this.ballAICollision();
        this.ballGoalCollision();
    }

    moveBall(){
        //this.state.ballX += this.state.ballDir.x * this.state.ballS;
        this.setState({
            ballX: this.state.ballX+this.state.ballDir.x * this.state.ballS,
            ballY: this.state.ballY+this.state.ballDir.y*this.state.ballS,
        })
        //this.state.ballY += this.state.ballDir.y * this.state.ballS;
    }

    movePlayer(){
        let newPos = this.state.playerY + (this.state.keys.down - this.state.keys.up) * this.state.playerS
        if (newPos < 0)
            newPos = 0;
        if (newPos > this.state.screenH)
            newPos = this.state.screenH;

        this.setState({
            playerY: newPos,
        })
    }

    moveAI(){
        let relativePos = this.state.ballY - this.state.aiY;

        this.setState({
            aiY: this.state.aiY + this.state.playerS*Math.sign(relativePos),
        })
    }

    ballScreenColision(){
        let ballLowerBound = this.state.ballY+(this.state.ballWH/2);
        let ballUpperBound = this.state.ballY-(this.state.ballWH/2);

        if (ballUpperBound <= 0 || ballLowerBound >= this.state.screenH){
            this.setState({
                ballDir: {
                    x: this.state.ballDir.x,
                    y: -this.state.ballDir.y,
                }
            })
        }
    }
    
    ballPlayerCollision(){
        let ballIsAbovePlayer = (this.state.ballY+(this.state.ballWH/2)) > (this.state.playerY+this.state.playerH);
        let ballIsUnderPlayer = (this.state.ballY-(this.state.ballWH/2)) < (this.state.playerY-this.state.playerH);

        if (ballIsAbovePlayer || ballIsUnderPlayer){
            return;
        }

        let ballLeftBound = (this.state.ballX-(this.state.ballWH/2));
        let playerRightBound = (this.state.playerX+this.state.playerW);

        if (ballLeftBound <= playerRightBound){
            this.setState({
                ballDir: {
                    x: 1,
                    y: this.state.ballDir.y,
                }
            })
        }
    }

    ballAICollision(){
        let ballIsAboveAI = (this.state.ballY+(this.state.ballWH/2)) > (this.state.aiY+this.state.playerH);
        let ballIsUnderAI = (this.state.ballY-(this.state.ballWH/2)) < (this.state.aiY-this.state.playerH);

        if (ballIsAboveAI || ballIsUnderAI){
            return;
        }

        let ballRightBound = (this.state.ballX+(this.state.ballWH/2));
        let aiLeftBound = (this.state.aiX-this.state.playerW);

        if (ballRightBound >= aiLeftBound){
            this.setState({
                ballDir: {
                    x: -1,
                    y: this.state.ballDir.y,
                }
            })
        }
    }

    ballGoalCollision(){
        let ballLeftBound = this.state.ballX-(this.state.ballWH/2);
        let ballRightBound = this.state.ballX-(this.state.ballWH/2);

        if (ballLeftBound <= 0){
            this.setState({
                score: {
                    player: this.state.score.player,
                    AI: this.state.score.AI+1,
                },
                ballX: this.state.ballInit.x,
                ballY: this.state.ballInit.y, 
            })
        }

        if (ballRightBound >= this.state.screenW){
            this.setState({
                score: {
                    player: this.state.score.player+1,
                    AI: this.state.score.AI,
                },
                ballX: this.state.ballInit.x,
                ballY: this.state.ballInit.y, 
            })
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.state.screenW, this.state.screenH);
        this.drawBackground(ctx);
        this.drawBall(ctx);
        this.drawPlayer(ctx);
        this.drawAI(ctx);
        this.drawScore(ctx);
    }

    drawBackground(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.state.screenW, this.state.screenH);
    }

    drawBall(ctx) {
        ctx.fillStyle = "white";
        let x = this.state.ballX - this.state.ballWH / 2;
        let y = this.state.ballY - this.state.ballWH / 2;
        ctx.fillRect(x, y, this.state.ballWH, this.state.ballWH);
    }

    drawPlayer(ctx){
        ctx.fillStyle = "white";
        let x = this.state.playerX - this.state.playerW / 2;
        let y = this.state.playerY - this.state.playerH / 2;
        ctx.fillRect(x, y, this.state.playerW, this.state.playerH);
    }

    drawAI(ctx){
        ctx.fillStyle = "blue";
        let x = this.state.aiX - this.state.playerW / 2;
        let y = this.state.aiY - this.state.playerH / 2;
        ctx.fillRect(x, y, this.state.playerW, this.state.playerH);
    }

    drawScore(ctx){
        ctx.fillStyle = "white";
        ctx.font = this.state.scoreFont;
        ctx.fillText(this.state.score.player, this.state.scoreX, this.state.scoreY);
        ctx.fillText(this.state.score.AI, this.state.screenW-this.state.scoreX, this.state.scoreY);
    }

    render() {
        return (
            <canvas ref="canvas" width={this.state.screenW} height={this.state.screenH} />
        )
    }
}

export default Pong;