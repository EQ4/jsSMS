/**
 * jsSMS - A Sega Master System/GameGear emulator in JavaScript
 * Copyright (C) 2012  Guillaume Marty (https://github.com/gmarty)
 * Based on JavaGear Copyright (c) 2002-2008 Chris White
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';



/**
 * Default implementation of UI. Could as well be defined as an interface, to
 * make sure we don't forget anything when implementing it.
 *
 * @constructor
 * @param {JSSMS} sms
 */
JSSMS.DummyUI = function(sms) {
  this.main = sms;
  this.enable = function() {};
  this.updateStatus = function() {};
  this.writeAudio = function() {};
  this.writeFrame = function() {};
};

if (typeof $ !== 'undefined') {
  /**
   * @constructor
   * @param {Object.<string, Object.<string, string>>} roms A list of rom files.
   */
  $.fn.JSSMSUI = function(roms) {
    var parent = /** HTMLElement **/ (this);
    var UI = function(sms) {
      this.main = sms;

      var self = this;

      // Create UI
      var root = $('<div></div>');
      var romContainer = $('<div class="roms"></div>');
      var controls = $('<div class="controls"></div>');

      // General settings
      /**
       * Contains the fullscreen API prefix or false if not supported.
       * @type {string|boolean}
       */
      var fullscreenSupport = JSSMS.Utils.getPrefix(['fullscreenEnabled', 'mozFullScreenEnabled', 'webkitCancelFullScreen']);

      /**
       * Contains the visibility API prefix or false if not supported.
       * @type {string|boolean}
       */
      this.hiddenPrefix = JSSMS.Utils.getPrefix(['hidden', 'mozHidden', 'webkitHidden', 'msHidden']);

      // Screen
      this.screen = $('<canvas width=' + SMS_WIDTH + ' height=' + SMS_HEIGHT + ' class="screen"></canvas>');
      this.canvasContext = this.screen[0].getContext('2d');

      if (!this.canvasContext.getImageData) {
        $(parent).html('<div class="alert-message error"><p><strong>Oh no!</strong> Your browser doesn\'t support writing pixels directly to the <code>&lt;canvas&gt;</code> tag. Try the latest versions of Firefox, Google Chrome, Opera or Safari!</p></div>');
        return;
      }

      this.canvasImageData = this.canvasContext.getImageData(0, 0, SMS_WIDTH, SMS_HEIGHT);
      this.resetCanvas();

      this.romSelect = $('<select></select>').appendTo(romContainer);

      // ROM loading
      this.romSelect.change(function() {
        self.loadROM();
        self.buttons.start.removeAttr('disabled');
      });

      // Buttons
      this.buttons = {
        start: $('<input type="button" value="Stop" class="btn" disabled="disabled">').appendTo(controls),
        restart: $('<input type="button" value="Restart" class="btn" disabled="disabled">').appendTo(controls),
        sound: $('<input type="button" value="Enable sound" class="btn" disabled="disabled">').appendTo(controls),
        zoom: $('<input type="button" value="Zoom in" class="btn">').appendTo(controls)
      };

      // @todo Add an exit fullScreen button.
      if (fullscreenSupport) {
        $('<input type="button" value="Go fullscreen" class="btn">').
            appendTo(controls).
            click(function() {
              var screen = /** @type {HTMLCanvasElement} */ (self.screen[0]);

              if (screen.requestFullscreen) {
                screen.requestFullscreen();
              } else if (screen.mozRequestFullScreen) {
                screen.mozRequestFullScreen();
              } else {
                screen.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
              }
            });
      }

      this.log = $('<div id="status"></div>');

      this.buttons.start.click(function() {
        if (!self.main.isRunning) {
          self.main.start();
          self.buttons.start.attr('value', 'Stop');
        } else {
          self.main.stop();
          self.updateStatus('Paused');
          self.buttons.start.attr('value', 'Start');
        }
      });

      this.buttons.restart.click(function() {
        if (!self.main.reloadRom()) {
          $(this).attr('disabled', 'disabled');
          return;
        }
        self.main.reset();
        self.main.vdp.forceFullRedraw();
        self.main.start();
      });

      this.buttons.sound.click(function() {
        /*if (self.main.soundEnabled) {
          self.main.soundEnabled = false;
          self.buttons.sound.attr('value', 'Enable sound');
        } else {
          self.nes.soundEnabled = true;
          self.buttons.sound.attr('value', 'Disable sound');
        }*/
      });

      this.zoomed = false;
      this.buttons.zoom.click(function() {
        if (self.zoomed) {
          self.screen.animate({
            width: SMS_WIDTH + 'px',
            height: SMS_HEIGHT + 'px'
          }, function() {
            $(this).removeAttr('style');
          });
          self.buttons.zoom.attr('value', 'Zoom in');
        } else {
          self.screen.animate({
            width: (SMS_WIDTH * 2) + 'px',
            height: (SMS_HEIGHT * 2) + 'px'
          });
          self.buttons.zoom.attr('value', 'Zoom out');
        }
        self.zoomed = !self.zoomed;
      });

      this.screen.appendTo(root);
      romContainer.appendTo(root);
      controls.appendTo(root);
      this.log.appendTo(root);
      root.appendTo($(parent));

      if (typeof roms != 'undefined') {
        this.setRoms(roms);
      }

      // Keyboard
      $(document).
          bind('keydown', function(evt) {
            self.main.keyboard.keydown(evt);
            //console.log(self.main.keyboard.controller1, self.main.keyboard.ggstart);
          }).
          bind('keyup', function(evt) {
            self.main.keyboard.keyup(evt);
            //console.log(self.main.keyboard.controller1, self.main.keyboard.ggstart);
          });

      // Sound
      self.sound = new XAudioServer(1, SAMPLE_RATE, 0, 8192 * 100, null, 1);
    };

    UI.prototype = {
      reset: function() {
        this.screen[0].width = SMS_WIDTH;
        this.screen[0].height = SMS_HEIGHT;

        this.log.text('');
      },


      resetCanvas: function() {
        this.canvasContext.fillStyle = 'black';
        // set alpha to opaque
        this.canvasContext.fillRect(0, 0, SMS_WIDTH, SMS_HEIGHT);

        // Set alpha
        for (var i = 3; i <= this.canvasImageData.data.length - 3; i += 4) {
          this.canvasImageData.data[i] = 0xFF;
        }
      },


      /**
       * Given an array of roms, build a select tag to allow game selection.
       *
       * @param {Object.<Array.<string>>} roms The list of roms.
       */
      setRoms: function(roms) {
        this.romSelect.children().remove();
        $('<option>Select a ROM...</option>').appendTo(this.romSelect);
        for (var groupName in roms) {
          if (roms.hasOwnProperty(groupName)) {
            var optgroup = $('<optgroup></optgroup>').
                attr('label', groupName);
            for (var i = 0; i < roms[groupName].length; i++) {
              $('<option>' + roms[groupName][i][0] + '</option>')
                .attr('value', roms[groupName][i][1])
                .appendTo(optgroup);
            }
            this.romSelect.append(optgroup);
          }
        }
      },


      loadROM: function() {
        var self = this;

        this.updateStatus('Downloading...');
        $.ajax({
          url: escape(this.romSelect.val()),
          xhr: function() {
            var xhr = $.ajaxSettings.xhr();
            if (typeof xhr.overrideMimeType !== 'undefined') {
              // Download as binary
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
            self.xhr = xhr;
            return xhr;
          },
          complete: function(xhr, status) {
            var i, data;
            /*if (JSSMS.Utils.isIE()) {
              var charCodes = JSNESBinaryToArray(xhr.responseBody).toArray();
              data = String.fromCharCode.apply(undefined, charCodes);
            } else {*/
            data = xhr.responseText;
            //}

            self.main.readRomDirectly(data, self.romSelect.val());
            self.main.reset();
            self.main.vdp.forceFullRedraw();
            self.main.start();
            self.enable();
          }
        });
      },


      /**
       * Enable and reset UI elements.
       */
      enable: function() {
        /*this.buttons.pause.removeAttr('disabled');
        if (this.main.isRunning) {
          this.buttons.pause.attr('value', 'pause');
        } else {
          this.buttons.pause.attr('value', 'resume');
        }*/
        this.buttons.restart.removeAttr('disabled');
        if (this.main.soundEnabled) {
          this.buttons.sound.attr('value', 'Disable sound');
        } else {
          this.buttons.sound.attr('value', 'Enable sound');
        }
      },


      /**
       * Update the message. Used mainly for displaying frame rate.
       *
       * @param {string} s The message to display.
       */
      updateStatus: function(s) {
        this.log.text(s);
      },


      /**
       * @param {Array.<number>} buffer
       */
      writeAudio: function(buffer) {
        var buffer = buffer.map(function(sample) {
          return sample / 128;
        });
        
        return this.sound.writeAudioNoCallback(buffer);
      },


      /**
       * Update the canvas screen. ATM, prevBuffer is not used. See JSNES for
       * an implementation of differential update.
       *
       * @param {Array.<number>} buffer
       * @param {Array.<number>} prevBuffer
       */
      writeFrame: function(buffer, prevBuffer) {
        // If browser supports visibility API and this page is hidden, we exit.
        if (this.hiddenPrefix && document[this.hiddenPrefix]) {
          return;
        }

        var imageData = this.canvasImageData.data;
        var pixel, i, j;

        for (i = 0; i <= SMS_WIDTH * SMS_HEIGHT; i++) {
          pixel = buffer[i];

          //if (pixel != prevBuffer[i]) {
          j = i * 4;
          imageData[j] = pixel & 0xFF;
          imageData[j + 1] = (pixel >> 8) & 0xFF;
          imageData[j + 2] = (pixel >> 16) & 0xFF;
          //prevBuffer[i] = pixel;
          //}
        }

        this.canvasContext.putImageData(this.canvasImageData, 0, 0);
      }
    };

    return UI;
  };
}
