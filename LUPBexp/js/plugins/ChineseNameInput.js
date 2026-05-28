/*:
 * @target MZ
 * @plugindesc 允許玩家使用鍵盤輸入中文名稱
 * @author Custom
 *
 * @param MaxLength
 * @text 最大字數
 * @type number
 * @default 6
 *
 * @command NameInput
 * @text 中文名稱輸入
 * @desc 讓玩家輸入中文名稱
 *
 * @arg actorId
 * @text 角色ID
 * @type actor
 * @default 1
 *
 * @arg maxLength
 * @text 最大字數
 * @type number
 * @default 6
 */

(() => {
    const pluginName = "ChineseNameInput";

    PluginManager.registerCommand(pluginName, "NameInput", function(args) {
        const actorId = Number(args.actorId);
        const maxLength = Number(args.maxLength) || 6;
        SceneManager.push(Scene_ChineseName);
        SceneManager.prepareNextScene(actorId, maxLength);
    });

    // 自訂場景
    function Scene_ChineseName() {
        this.initialize(...arguments);
    }

    Scene_ChineseName.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_ChineseName.prototype.constructor = Scene_ChineseName;

    Scene_ChineseName.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_ChineseName.prototype.prepare = function(actorId, maxLength) {
        this._actorId = actorId;
        this._maxLength = maxLength;
    };

    Scene_ChineseName.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this._actor = $gameActors.actor(this._actorId);
        this.createInputElement();
        this.createPromptWindow();
    };

    Scene_ChineseName.prototype.createPromptWindow = function() {
        const ww = 400;
        const wh = 160;
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = (Graphics.boxHeight - wh) / 2 - 100;
        const rect = new Rectangle(wx, wy, ww, wh);
        this._promptWindow = new Window_Base(rect);
        this._promptWindow.drawText("請輸入名稱：", 0, 10, ww - 40, "center");
        this.addWindow(this._promptWindow);
    };

    Scene_ChineseName.prototype.createInputElement = function() {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "chineseNameInput";
        input.maxLength = this._maxLength;
        input.style.position = "absolute";
        input.style.left = "50%";
        input.style.top = "55%";
        input.style.transform = "translate(-50%, -50%)";
        input.style.fontSize = "24px";
        input.style.padding = "10px 20px";
        input.style.width = "300px";
        input.style.textAlign = "center";
        input.style.border = "2px solid #fff";
        input.style.borderRadius = "8px";
        input.style.backgroundColor = "rgba(0,0,0,0.7)";
        input.style.color = "#ffffff";
        input.style.outline = "none";
        input.style.zIndex = "1000";
        input.placeholder = this._actor.name();
        input.value = "";

        // 確認按鈕
        const btn = document.createElement("button");
        btn.textContent = "確定";
        btn.style.position = "absolute";
        btn.style.left = "50%";
        btn.style.top = "65%";
        btn.style.transform = "translate(-50%, -50%)";
        btn.style.fontSize = "20px";
        btn.style.padding = "8px 40px";
        btn.style.border = "none";
        btn.style.borderRadius = "6px";
        btn.style.backgroundColor = "#4488ff";
        btn.style.color = "#fff";
        btn.style.cursor = "pointer";
        btn.style.zIndex = "1000";

        btn.addEventListener("click", () => {
            this.onInputOk(input.value);
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.onInputOk(input.value);
            }
            e.stopPropagation();
        });

        document.body.appendChild(input);
        document.body.appendChild(btn);
        this._inputElement = input;
        this._btnElement = btn;

        setTimeout(() => input.focus(), 100);
    };

    Scene_ChineseName.prototype.onInputOk = function(name) {
        if (name.trim() === "") {
            // 如果沒輸入，保留原名
            name = this._actor.name();
        }
        this._actor.setName(name.trim().substring(0, this._maxLength));
        this.removeInputElement();
        SceneManager.pop();
    };

    Scene_ChineseName.prototype.removeInputElement = function() {
        if (this._inputElement && this._inputElement.parentNode) {
            this._inputElement.parentNode.removeChild(this._inputElement);
        }
        if (this._btnElement && this._btnElement.parentNode) {
            this._btnElement.parentNode.removeChild(this._btnElement);
        }
    };

    Scene_ChineseName.prototype.terminate = function() {
        Scene_MenuBase.prototype.terminate.call(this);
        this.removeInputElement();
    };

    window.Scene_ChineseName = Scene_ChineseName;
})();