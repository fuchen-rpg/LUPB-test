// js/plugins/DataUploader.js

/*:
 * @target MZ
 * @plugindesc 遊戲結束時上傳資料到 Google Sheets
 * @author YourName
 *
 * @param Google Script URL
 * @desc Google Apps Script 的部署網址（必須是 /exec 結尾）
 * @type string
 * @default https://script.google.com/macros/s/AKfycbzGEOOZsa-p4hAMB75CYGFkfgu7tBEZ9yeOUzBL8sR4Y70bGpOAv4RDztoozvOJ9Ze78Q/exec
 *
 * @param Condition Variable
 * @type variable
 * @default 1
 *
 * @param BLM Variable
 * @type variable
 * @default 2
 *
 * @param Reward Variable
 * @type variable
 * @default 3
 *
 * @param Accountability Variable
 * @type variable
 * @default 4
 *
 * @param Decision1 Variable
 * @type variable
 * @default 5
 *
 * @param Decision2 Variable
 * @type variable
 * @default 6
 *
 * @param Decision3 Variable
 * @type variable
 * @default 7
 *
 * @param Decision4 Variable
 * @type variable
 * @default 8
 *
 * @param Decision5 Variable
 * @type variable
 * @default 9
 *
 * @param Decision6 Variable
 * @type variable
 * @default 10
 *
 * @param Phone Variable
 * @type variable
 * @default 11
 *
 * @param Birthday Variable
 * @type variable
 * @default 12
 *
 * @param Rewardnum Variable
 * @type variable
 * @default 13
 *
 * @param BLMnum Variable
 * @type variable
 * @default 14
 *
 * @param Accountnum Variable
 * @type variable
 * @default 15
 *
 * @command SubmitData
 * @text 上傳資料到 Google Sheets
 * @desc 將受試者資料（條件、決策等）上傳到 Google Sheets
 */

(() => {
    'use strict';

    const pluginName = 'DataUploader';
    const params = PluginManager.parameters(pluginName);

    const SCRIPT_URL = String(params['Google Script URL'] || '');

    const COND_VAR = Number(params['Condition Variable'] || 1);
    const BLM_VAR = Number(params['BLM Variable'] || 2);
    const REWARD_VAR = Number(params['Reward Variable'] || 3);
    const ACCOUNT_VAR = Number(params['Accountability Variable'] || 4);
    const D1 = Number(params['Decision1 Variable'] || 5);
    const D2 = Number(params['Decision2 Variable'] || 6);
    const D3 = Number(params['Decision3 Variable'] || 7);
    const D4 = Number(params['Decision4 Variable'] || 8);
    const D5 = Number(params['Decision5 Variable'] || 9);
    const D6 = Number(params['Decision6 Variable'] || 10);
    const PHONE_VAR = Number(params['Phone Variable'] || 11);
    const BIRTHDAY_VAR = Number(params['Birthday Variable'] || 12);
    const REWARDNUM_VAR = Number(params['Rewardnum Variable'] || 13);
    const BLMNUM_VAR = Number(params['BLMnum Variable'] || 14);
    const ACCOUNTNUM_VAR = Number(params['Accountnum Variable'] || 15);

    window._gameStartTime = window._gameStartTime || Date.now();

    PluginManager.registerCommand(pluginName, 'SubmitData', function() {
        const interpreter = this;
        interpreter.setWaitMode('dataUpload');
        window._dataSubmitted = false;

        const playTimeSeconds = Math.floor((Date.now() - (window._gameStartTime || Date.now())) / 1000);

        const phone3 = String($gameVariables.value(PHONE_VAR)).padStart(3, '0');
        const birthday4 = String($gameVariables.value(BIRTHDAY_VAR)).padStart(4, '0');
        const participantID = phone3 + birthday4;

        const payload = {
            sessionId: window._sessionId || 'unknown',
            participantID: participantID,
            phone3: phone3,
            birthday4: birthday4,
            condition: $gameVariables.value(COND_VAR),
            blm: $gameVariables.value(BLM_VAR) === 1 ? 'High' : 'Low',
            reward: $gameVariables.value(REWARD_VAR) === 1 ? 'High' : 'Low',
            accountability: $gameVariables.value(ACCOUNT_VAR) === 1 ? 'High' : 'Low',
            decision1: $gameVariables.value(D1),
            decision2: $gameVariables.value(D2),
            decision3: $gameVariables.value(D3),
            decision4: $gameVariables.value(D4),
            decision5: $gameVariables.value(D5),
            decision6: $gameVariables.value(D6),
            rewardNum: $gameVariables.value(REWARDNUM_VAR),
            blmNum: $gameVariables.value(BLMNUM_VAR),
            accountNum: $gameVariables.value(ACCOUNTNUM_VAR),
            playTime: playTimeSeconds
        };

        console.log('Uploading to:', SCRIPT_URL);
        console.log('Payload:', JSON.stringify(payload));

        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        }).then(() => {
            console.log('Data submitted successfully');
            window._dataSubmitted = true;
        }).catch((err) => {
            console.error('Submit failed:', err);
            try {
                const backup = JSON.parse(localStorage.getItem('_gameBackup') || '[]');
                backup.push(payload);
                localStorage.setItem('_gameBackup', JSON.stringify(backup));
            } catch(e) {}
            window._dataSubmitted = true;
        });
    });

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'dataUpload') {
            if (!window._dataSubmitted) {
                return true;
            } else {
                this._waitMode = '';
                return false;
            }
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

})();