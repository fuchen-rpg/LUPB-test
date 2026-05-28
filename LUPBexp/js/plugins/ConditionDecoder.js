// js/plugins/ConditionDecoder.js

/*:
 * @target MZ
 * @plugindesc 將 condition 編號解碼為 BLM、Reward、Accountability 三個變數
 * @author YourName
 *
 * @param Condition Variable ID
 * @desc 存放 condition 編號的變數 ID
 * @type variable
 * @default 1
 *
 * @param BLM Variable ID
 * @desc 存放 BLM 高低的變數 ID（1=High, 2=Low）
 * @type variable
 * @default 2
 *
 * @param Reward Variable ID
 * @desc 存放 Reward 高低的變數 ID（1=High, 2=Low）
 * @type variable
 * @default 3
 *
 * @param Accountability Variable ID
 * @desc 存放 Accountability 高低的變數 ID（1=High, 2=Low）
 * @type variable
 * @default 4
 *
 * @command DecodeCondition
 * @text 解碼 Condition
 * @desc 手動觸發解碼（通常自動執行，不需要手動呼叫）
 *
 * @command SetCondition
 * @text 手動設定 Condition（測試用）
 * @desc 直接指定 condition 編號，方便測試
 *
 * @arg conditionNumber
 * @text Condition 編號
 * @desc 輸入 1~8 的編號
 * @type number
 * @min 1
 * @max 8
 * @default 1
 */

(() => {
    'use strict';

    const pluginName = 'ConditionDecoder';
    const params = PluginManager.parameters(pluginName);
    const COND_VAR = Number(params['Condition Variable ID'] || 1);
    const BLM_VAR = Number(params['BLM Variable ID'] || 2);
    const REWARD_VAR = Number(params['Reward Variable ID'] || 3);
    const ACCOUNT_VAR = Number(params['Accountability Variable ID'] || 4);

    // 對照表：condition → [BLM, Reward, Accountability]
    // 1=High, 2=Low
    const CONDITIONS = {
        1: [1, 1, 1],  // HHH
        2: [1, 1, 2],  // HHL
        3: [1, 2, 1],  // HLH
        4: [1, 2, 2],  // HLL
        5: [2, 1, 1],  // LHH
        6: [2, 1, 2],  // LHL
        7: [2, 2, 1],  // LLH
        8: [2, 2, 2]   // LLL
    };

    // 解碼函數
    function decodeCondition(cond) {
        if (!cond || cond < 1 || cond > 8) {
            cond = Math.floor(Math.random() * 8) + 1;
        }
        $gameVariables.setValue(COND_VAR, cond);

        const decoded = CONDITIONS[cond];
        $gameVariables.setValue(BLM_VAR, decoded[0]);
        $gameVariables.setValue(REWARD_VAR, decoded[1]);
        $gameVariables.setValue(ACCOUNT_VAR, decoded[2]);

        console.log('Condition:', cond,
                    '| BLM:', decoded[0] === 1 ? 'High' : 'Low',
                    '| Reward:', decoded[1] === 1 ? 'High' : 'Low',
                    '| Accountability:', decoded[2] === 1 ? 'High' : 'Low');
    }

    // 從 URL 讀取 condition 參數
    function getUrlCondition() {
        const url = window.location.href;
        const match = url.match(/[?&]condition=(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    // 插件命令：解碼（手動觸發）
    PluginManager.registerCommand(pluginName, 'DecodeCondition', function() {
        const cond = getUrlCondition();
        decodeCondition(cond);
    });

    // 插件命令：手動設定 Condition（測試用）
    PluginManager.registerCommand(pluginName, 'SetCondition', function(args) {
        const cond = Number(args.conditionNumber);
        decodeCondition(cond);
    });

    // 攔截遊戲開始，自動解碼
    const _DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        _DataManager_setupNewGame.call(this);

        const cond = getUrlCondition();
        decodeCondition(cond);
    };

    // 記錄遊戲開始時間與 session ID
    window._gameStartTime = Date.now();
    window._sessionId = 'S_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

})();