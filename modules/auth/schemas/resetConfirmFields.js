((function(vars, global) {
    for (let i in vars) {
        global[i] = vars[i];
    }
})({
    getResetConfirmFields: function() {
        return {
            username: {
                mandatoryCreate: true,
                length: {
                    min: 3,
                    max: 20
                },
                type: 'string',
                regexp: /^[\u0000-~\u0080-þĀ-žƀ-ɎͰ-ϾЀ-ӾԀ-\u052e\u0530-\u058e\u0590-\u05fe٠-٩۰-۹߀-߉०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯๐-๙໐-໙༠-༩၀-၉႐-႙Ⴀ-\u10feᄀ-\u11fe០-៩᠀-\u18ae᥆-᥏᧐-᧙᭐-᭙᮰-᮹᱀-᱉᱐-᱙Ḁ-Ỿἀ-῾Ⱡ-\u2c7e\u2de0-\u2dfe꘠-꘩Ꙁ-\ua69e꜠-ꟾ꣐-꣙꤀-꤉꩐-꩙０-９]|\ud800[\udd40-\udd8e]|\ud801[\udca0-\udca9]|\ud834[\ude00-\ude4e]|\ud835[\udfce-\udfff]+$/,
                process: function(item) {
                    return item.trim().toLowerCase();
                }
            },
            code: {
                mandatoryCreate: true,
                length: {
                    min: 32,
                    max: 32
                },
                type: 'string',
                regexp: /^[a-f0-9]+$/,
                process: function(item) {
                    return item.trim();
                }
            },
            password: {
                mandatoryCreate: true,
                length: {
                    min: 8,
                    max: 50
                },
                type: 'string',
                process: function(item) {
                    return item.trim();
                }
            }
        };
    }
}, typeof exports === 'undefined' ? this : exports));
