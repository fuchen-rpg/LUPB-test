// js/plugins/ParticipantID.js

/*:
 * @target MZ
 * @plugindesc 讓受試者輸入辨識碼（手機後3碼＋生日後4碼）
 * @author YourName
 *
 * @param Phone Variable ID
 * @desc 存放手機後3碼的變數 ID
 * @type variable
 * @default 5
 *
 * @param Birthday Variable ID
 * @desc 存放生日後4碼的變數 ID
 * @type variable
 * @default 6
 *
 * @command AskPhone
 * @text 輸入手機後3碼
 * @desc 顯示對話框讓受試者輸入手機號碼後3碼
 *
 * @command AskBirthday
 * @text 輸入生日後4碼
 * @desc 顯示對話框讓受試者輸入生日後4碼（月日）
 *
 * @command AskAll
 * @text 依序輸入手機+生日
 * @desc 依序詢問手機後3碼和生日後4碼，自動組合為完整ID
 */

(() => {
    'use strict';

    const pluginName = 'ParticipantID';
    const params = PluginManager.parameters(pluginName);
    const PHONE_VAR = Number(params['Phone Variable ID'] || 5);
    const BDAY_VAR = Number(params['Birthday Variable ID'] || 6);

    // 全域儲存（字串格式，保留前導零）
    window._participantPhone = '';
    window._participantBirthday = '';
    window._participantID = '';

    // 建立輸入對話框
    function showInputDialog(promptText, maxLength) {
        return new Promise((resolve) => {
            // 建立遮罩
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; display:flex; align-items:center; justify-content:center;';

            // 建立對話框
            const box = document.createElement('div');
            box.style.cssText = 'background:#2c2c2c; border:2px solid #fff; border-radius:12px; padding:30px; text-align:center; min-width:320px; font-family:sans-serif;';

            const label = document.createElement('p');
            label.textContent = promptText;
            label.style.cssText = 'color:#fff; font-size:18px; margin-bottom:16px;';

            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = maxLength;
            input.pattern = '\\d{' + maxLength + '}';
            input.inputMode = 'numeric';
            input.style.cssText = 'font-size:28px; text-align:center; width:160px; padding:8px; border-radius:6px; border:2px solid #888; letter-spacing:8px;';

            const hint = document.createElement('p');
            hint.textContent = '請輸入 ' + maxLength + ' 位數字';
            hint.style.cssText = 'color:#aaa; font-size:13px; margin-top:8px;';

            const errorMsg = document.createElement('p');
            errorMsg.style.cssText = 'color:#ff6b6b; font-size:13px; margin-top:4px; min-height:20px;';

            const btn = document.createElement('button');
            btn.textContent = '確認';
            btn.style.cssText = 'margin-top:16px; padding:10px 32px; font-size:16px; background:#4a9eff; color:#fff; border:none; border-radius:6px; cursor:pointer;';

            btn.onclick = function() {
                const val = input.value.trim();
                const regex = new RegExp('^\\d{' + maxLength + '}$');
                if (!regex.test(val)) {
                    errorMsg.textContent = '請輸入正確的 ' + maxLength + ' 位數字';
                    input.focus();
                    return;
                }
                document.body.removeChild(overlay);
                resolve(val);
            };

            input.onkeydown = function(e) {
                if (e.key === 'Enter') btn.click();
            };

            box.appendChild(label);
            box.appendChild(input);
            box.appendChild(hint);
            box.appendChild(errorMsg);
            box.appendChild(document.createElement('br'));
            box.appendChild(btn);
            overlay.appendChild(box);
            document.body.appendChild(overlay);

            setTimeout(() => { input.focus(); }, 100);
        });
    }

    // 註冊插件命令：輸入手機後3碼
    PluginManager.registerCommand(pluginName, 'AskPhone', function() {
        const interpreter = this;
        interpreter.setWaitMode('participantInput');
        window._waitingForInput = true;

        showInputDialog('請輸入手機號碼後 3 碼', 3).then((val) => {
            window._participantPhone = val;
            $gameVariables.setValue(PHONE_VAR, parseInt(val));
            window._waitingForInput = false;
        });
    });

    // 註冊插件命令：輸入生日後4碼
    PluginManager.registerCommand(pluginName, 'AskBirthday', function() {
        const interpreter = this;
        interpreter.setWaitMode('participantInput');
        window._waitingForInput = true;

        showInputDialog('請輸入生日後 4 碼（月日，例如 0315）', 4).then((val) => {
            window._participantBirthday = val;
            $gameVariables.setValue(BDAY_VAR, parseInt(val));
            window._participantID = window._participantPhone + window._participantBirthday;
            window._waitingForInput = false;
        });
    });

    // 註冊插件命令：依序詢問全部
    PluginManager.registerCommand(pluginName, 'AskAll', function() {
        const interpreter = this;
        interpreter.setWaitMode('participantInput');
        window._waitingForInput = true;

        showInputDialog('請輸入手機號碼後 3 碼', 3).then((phoneVal) => {
            window._participantPhone = phoneVal;
            $gameVariables.setValue(PHONE_VAR, parseInt(phoneVal));

            return showInputDialog('請輸入生日後 4 碼（月日，例如 0315）', 4);
        }).then((bdayVal) => {
            window._participantBirthday = bdayVal;
            $gameVariables.setValue(BDAY_VAR, parseInt(bdayVal));
            window._participantID = window._participantPhone + window._participantBirthday;
            window._waitingForInput = false;
        });
    });

    // 讓事件等待輸入完成
    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'participantInput') {
            if (window._waitingForInput) {
                return true;
            } else {
                this._waitMode = '';
                return false;
            }
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

})();