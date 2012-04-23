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
 * The frequency in ms at which each frame is displayed, calculated this way:
 * frameTime = 1 sec. / frame_number_per_second
 * @const
 */
var frameTime = 17 /*Math.round(1000 / 60)*/;


/**
 * The frequency in ms at which the fps rate is displayed.
 * @const
 */
var fpsInterval = 500;


/**
 * NTSC Clock Speed (3579545Hz for NTSC systems).
 * @const
 */
var CLOCK_NTSC = 3579545;


/**
 * PAL Clock Speed (3546893Hz for PAL/SECAM systems).
 * @const
 */
var CLOCK_PAL = 3546893;



/**
 * @constructor
 * @param {Object.<string, *>} opts
 */
function JSSMS(opts) {
  this.opts = {
    'ui': JSSMS.DummyUI,
    'swfPath': 'lib/'
  };
  if (typeof opts != 'undefined') {
    var key;
    for (key in this.opts) {
      if (typeof opts[key] != 'undefined') {
        this.opts[key] = opts[key];
      }
    }
  }

  this.keyboard = new JSSMS.Keyboard(this);
  this.ui = new opts['ui'](this);
  this.vdp = new JSSMS.Vdp(this);
  this.psg = new JSSMS.SN76489(this);
  this.ports = new JSSMS.Ports(this);
  this.cpu = new JSSMS.Z80(this);

  this.ui.updateStatus('Ready to load a ROM.');
}

JSSMS.prototype = {
  /**
   * Is thread running?
   * @type {boolean}
   */
  isRunning: false,


  /**
   * CPU cycles per scanline.
   * @type {number}
   */
  cyclesPerLine: 0,


  /**
   * No of scanlines to render (including blanking).
   * @type {number}
   */
  no_of_scanlines: 0,


  /**
   * Render every FRAMESKIP frames.
   * @type {number}
   */
  frameSkip: 0,


  /**
   * Throttle mode.
   * @type {boolean}
   */
  throttle: true,


  /**
   * Target FPS (NTSC / PAL).
   * @type {number}
   */
  fps: 0,


  /**
   * Counter for frameskip.
   * @type {number}
   */
  frameskip_counter: 0,


  /**
   * SMS Pause button pressed?
   * @type {boolean}
   */
  pause_button: false,


  /**
   * SMS mode.
   * @type {boolean}
   */
  is_sms: true,


  /**
   * GG mode.
   * @type {boolean}
   */
  is_gg: false,


  // Audio Related
  /**
   * Sound enabled.
   * @type {boolean}
   */
  soundEnabled: true,


  /**
   * Audio buffer.
   * Should be a Float32Array.
   * @type {Array.<number>}
   */
  audioBuffer: [],


  /**
   * Offset into audio buffer.
   * @type {number}
   */
  audioBufferOffset: 0,


  /**
   * Number of samples to generate per frame.
   * @type {number}
   */
  samplesPerFrame: 0,


  /** How many samples to generate per line.
   * @type {Array.<number>}
   */
  samplesPerLine: [],


  // Emulation Related
  /**
   * Emulated screen width.
   * @type {number}
   */
  emuWidth: 0,


  /**
   * Emulated screen height.
   * @type {number}
   */
  emuHeight: 0,


  /**
   * @type {number}
   */
  fpsFrameCount: 0,


  /**
   * @type {number}
   * @private
   */
  z80Time: 0,


  /**
   * @type {number}
   * @private
   */
  drawTime: 0,


  /**
   * @type {number}
   * @private
   */
  z80TimeCounter: 0,


  /**
   * @type {number}
   * @private
   */
  drawTimeCounter: 0,


  /**
   * @type {number}
   * @private
   */
  frameCount: 0,


  /**
   * The data of the rom currently loaded.
   * @type {string}
   */
  romData: '',


  /**
   * The file name of the current loaded rom.
   * @type {string}
   */
  romFileName: '',


  /**
   * Reset all emulation.
   */
  reset: function() {
    // Setup Default Timing
    this.setVideoTiming(this.vdp.videoMode);

    this.frameCount = 0;
    this.frameskip_counter = this.frameSkip;

    this.keyboard.reset();
    this.ui.reset();
    this.vdp.reset();
    this.ports.reset();
    this.cpu.reset();
    this.cpu.resetMemory(null);
  },


  start: function() {
    var self = this;

    if (!this.isRunning) {
      this.isRunning = true;
    }

    this.frameInterval = setInterval(function() {
      self.frame();
    }, frameTime);

    this.resetFps();
    this.printFps();
    this.fpsInterval = setInterval(function() {
      self.printFps();
    }, fpsInterval);
  },


  stop: function() {
    clearInterval(this.frameInterval);
    clearInterval(this.fpsInterval);
    this.isRunning = false;
  },


  frame: function() {
    // No throttling: faster code if phone is slow
    if (!this.throttle) {
      if (this.emulateNextFrame())
        this.doRepaint();
      //if (minSleep != 0)
    //Thread.sleep(minSleep);
    // Throttling, also try a minimum sleep per tick
    } else {
      var startTime = +new Date();

      if (this.emulateNextFrame())
        this.doRepaint();

      /*if (ID == J2ME) {
        long frameTime = JSSMS.Utils.currentTimeMillis() - startTime;

        if (frameTime < targetFrameTime - minSleep) {
                            Thread.sleep(targetFrameTime - frameTime);
        } else if (minSleep != 0)
                            Thread.sleep(minSleep);
      } else if (ID == J2SE) {
        platformFunction(this, PLATFORM_THROTTLE);
      }*/
    }
    this.fpsFrameCount++;
  },


  /**
   * @return {boolean} Whether a screen update is required or not.
   */
  emulateNextFrame: function() {
    var startTime;
    var lineno;

    // Draw one frame
    for (lineno = 0; lineno < this.no_of_scanlines; lineno++) {
      if (Setup.DEBUG_TIMING) startTime = +new Date();

      // Run Z80
      //
      // Ensure interrupts always occur, and vblank is taken between instructions
      // If the IRQ status flag is set *during* the execution of an instruction the
      // CPU will be able to read it without the interrupt occurring.
      //
      // For example, "IN A,($BF)" is 11 T-states. If bit 7 of the status flags is reset prior
      // the instruction being fetched and executed, but then set 2 T-states into execution,
      // then the value read from the I/O port will have bit 7 set.
      if (Setup.ACCURATE_INTERRUPT_EMULATION && lineno == 193) {
        this.cpu.run(this.cyclesPerLine, 8);  // Run until 8 cycles remaining
        this.vdp.setVBlankFlag();        // Then set VBlank flag
        this.cpu.run(0, 0);              // Run for remaining 8 cycles
      } else {
        this.cpu.run(this.cyclesPerLine, 0);
      }

      if (Setup.DEBUG_TIMING) this.z80TimeCounter += +new Date() - startTime;

      // PSG
      if (this.soundEnabled)
        this.updateSound(lineno);

      // VDP
      this.vdp.line = lineno;

      // Draw Next Line
      if (this.frameskip_counter == 0 && lineno < 192) {
        if (Setup.DEBUG_TIMING) startTime = +new Date();
        this.vdp.drawLine(lineno);
        if (Setup.DEBUG_TIMING) this.drawTimeCounter += +new Date() - startTime;
      }

      // Assert Interrupt Line if Necessary
      this.vdp.interrupts(lineno);
    }

    if (this.soundEnabled)
      this.audioOutput(this.audioBuffer);

    // Reset framecount once we've drawn 60 frames per second
    if (Setup.DEBUG_TIMING && ++this.frameCount == 60) {
      this.z80Time = this.z80TimeCounter;
      this.drawTime = this.drawTimeCounter;

      this.z80TimeCounter = 0;
      this.drawTimeCounter = 0;

      this.frameCount = 0;
    }

    // Only Check for Pause Button once per frame to increase emulation speed
    if (this.pause_button) {
      this.cpu.nmi();
      this.pause_button = false;
    }

    if (this.frameskip_counter-- == 0) {
      this.frameskip_counter = this.frameSkip;
      return true;
    }
    return false;
  },


  /**
   * Set SMS Mode.
   */
  setSMS: function() {
    this.is_sms = true;
    this.is_gg = false;

    this.vdp.h_start = 0;
    this.vdp.h_end = 32;

    this.emuWidth = SMS_WIDTH;
    this.emuHeight = SMS_HEIGHT;
  },


  /**
   * Set GG Mode.
   */
  setGG: function() {
    this.is_gg = true;
    this.is_sms = false;

    this.vdp.h_start = 5;
    this.vdp.h_end = 27;

    this.emuWidth = GG_WIDTH;
    this.emuHeight = GG_HEIGHT;
  },


  /**
   * Set NTSC/PAL Timing.
   *
   * Exact timings from:
   * http://www.smspower.org/dev/docs/wiki/Systems/MasterSystem
   */
  setVideoTiming: function(mode) {
    var clockSpeedHz = 0,
        i, v;

    // Game Gear should only work in NTSC
    if (mode == NTSC || this.is_gg) {
      this.fps = 60;
      this.no_of_scanlines = SMS_Y_PIXELS_NTSC;
      clockSpeedHz = CLOCK_NTSC;
    } else if (mode == PAL) {
      this.fps = 50;
      this.no_of_scanlines = SMS_Y_PIXELS_PAL;
      clockSpeedHz = CLOCK_PAL;
    }

    // Add one manually here for rounding accuracy
    this.cyclesPerLine = Math.round((clockSpeedHz / this.fps / this.no_of_scanlines) + 1);
    this.vdp.videoMode = mode;

    // Setup appropriate sound buffer
    if (this.soundEnabled) {
      this.psg.init(clockSpeedHz, SAMPLE_RATE);

      this.samplesPerFrame = Math.round(SAMPLE_RATE / this.fps);

      if (this.audioBuffer.length == 0 || this.audioBuffer.length != this.samplesPerFrame)
        this.audioBuffer = new Array(this.samplesPerFrame);

      if (this.samplesPerLine.length == 0 || this.samplesPerLine.length != this.no_of_scanlines) {
        this.samplesPerLine = new Array(this.no_of_scanlines);

        var fractional = 0;

        // Calculate number of sound samples to generate per scanline
        for (i = 0; i < this.no_of_scanlines; i++) {
          v = ((this.samplesPerFrame << 16) / this.no_of_scanlines) + fractional;
          fractional = v - ((v >> 16) << 16);
          this.samplesPerLine[i] = v >> 16;
        }
      }
    }

    //setFrameSkip(frameSkip);
  },


  // Sound Output
  /**
   * @param {Array.<number>} buffer
   */
  audioOutput: function(buffer) {
    this.ui.writeAudio(buffer);
  },


  // Screen Rendering
  doRepaint: function() {
    this.ui.writeFrame(this.vdp.display, []);
  },


  printFps: function() {
    var now = +new Date(),
        s = 'Running';

    if (this.lastFpsTime) {
      s += ': '
        + (this.fpsFrameCount / ((now - this.lastFpsTime) / 1000)).toFixed(2)
        + ' (/ '
        + (1000 / frameTime).toFixed(2)
        + ') FPS';
    }
    this.ui.updateStatus(s);
    this.fpsFrameCount = 0;
    this.lastFpsTime = now;
  },


  resetFps: function() {
    this.lastFpsTime = null;
    this.fpsFrameCount = 0;
  },


  /**
   * @param {number} line
   */
  updateSound: function(line) {
    if (line == 0)
      this.audioBufferOffset = 0;

    var samplesToGenerate = this.samplesPerLine[line];
    this.audioBuffer = this.psg.update(this.audioBufferOffset, samplesToGenerate);
    this.audioBufferOffset += samplesToGenerate;
  },


  // File Loading Routines
  /**
   * Bypass config file and directly load rom.
   *
   * \@todo readRomDirectly() and loadROM() can be confusing. Renaming needed.
   *
   * @param {string} data Rom binary data.
   * @param {string} fileName Filename to load.
   * @return {boolean}
   */
  readRomDirectly: function(data, fileName) {
    var pages;
    var mode = fileName.substr(-3).toLowerCase() === '.gg' ? 2 : 1;
    var size = data.length;

    // Toggle SMS / GG emulation mode
    if (mode == 1) this.setSMS();
    else if (mode == 2) this.setGG();

    if (size <= Setup.PAGE_SIZE) {
      return false;
    }

    pages = this.loadROM(data, size);

    if (pages == null) return false;

    // Default Mapping (Needed or Shinobi doesn't work)
    this.cpu.resetMemory(pages);

    // Store these info locally to enable rom reloading
    this.romData = data;
    this.romFileName = fileName;

    return true;
  },


  /**
   * \@todo readRomDirectly() and loadROM() can be confusing. Renaming needed.
   *
   * @param {string} data Rom binary data.
   * @param {number} size
   * @return {Array.<Array.<number>>}
   */
  loadROM: function(data, size) {
    // Strip 512 Byte File Headers
    if ((size % 1024) != 0) {
      data = data.substr(512); // skip 512 bytes
      size -= 512;
    }

    // Calculate number of pages from file size and create array appropriately
    var i, j;
    var number_of_pages = Math.round(size / Setup.PAGE_SIZE);
    var pages = new Array(number_of_pages);

    for (i = 0; i < number_of_pages; i++) {
      pages[i] = new Array(Setup.PAGE_SIZE);
      // Read file into pages array
      // second value is offset, third is length
      //is.read(pages[i / Setup.PAGE_SIZE], 0x0000, Setup.PAGE_SIZE);
      for (j = 0; j < Setup.PAGE_SIZE; j++) {
        pages[i][j] = data.charCodeAt((i * Setup.PAGE_SIZE) + j) & 0xFF;
      }
    }

    return pages;
  },


  /**
   * Reload a rom previously set in memory. Returns true if a rom was
   * successfully reloaded.
   *
   * @return {boolean}
   */
  reloadRom: function() {
    if (this.romData !== '' && this.romFileName !== '') {
      return this.readRomDirectly(this.romData, this.romFileName);
    } else {
      return false;
    }
  }
};
