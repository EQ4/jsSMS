/*
 jsSMS - A Sega Master System/GameGear emulator in JavaScript
 Copyright (C) 2012  Guillaume Marty (https://github.com/gmarty)
 Based on JavaGear Copyright (c) 2002-2008 Chris White.

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';var $JSCompiler_alias_TRUE$$ = !0, $JSCompiler_alias_NULL$$ = null, $JSCompiler_alias_FALSE$$ = !1;
function $JSCompiler_emptyFn$$() {
  return function() {
  }
}
;function $JSSMS$$($opts$$) {
  this.$opts$ = {ui: $JSSMS$DummyUI$$, swfPath: 'lib/'};
  if ('undefined' != typeof $opts$$) {
    for (var $key$$15$$ in this.$opts$) {
      'undefined' != typeof $opts$$[$key$$15$$] && (this.$opts$[$key$$15$$] = $opts$$[$key$$15$$]);
    }
  }
  this.$keyboard$ = new $JSSMS$Keyboard$$(this);
  this.$ui$ = new $opts$$.ui(this);
  this.$vdp$ = new $JSSMS$Vdp$$(this);
  this.$psg$ = new $JSSMS$SN76489$$(this);
  this.ports = new $JSSMS$Ports$$(this);
  this.$cpu$ = new $JSSMS$Z80$$(this);
  this.$ui$.updateStatus('Ready to load a ROM.');
}
$JSSMS$$.prototype = {$isRunning$: $JSCompiler_alias_FALSE$$, $cyclesPerLine$: 0, $no_of_scanlines$: 0, $frameSkip$: 0, $fps$: 0, $frameskip_counter$: 0, $pause_button$: $JSCompiler_alias_FALSE$$, $is_sms$: $JSCompiler_alias_TRUE$$, $is_gg$: $JSCompiler_alias_FALSE$$, $soundEnabled$: $JSCompiler_alias_TRUE$$, $audioBuffer$: [], $audioBufferOffset$: 0, $samplesPerFrame$: 0, $samplesPerLine$: [], $fpsFrameCount$: 0, $z80TimeCounter$: 0, $drawTimeCounter$: 0, $frameCount$: 0, $romData$: '', $romFileName$: '', reset: function $$JSSMS$$$$reset$() {
  this.$setVideoTiming$(this.$vdp$.$videoMode$);
  this.$frameCount$ = 0;
  this.$frameskip_counter$ = this.$frameSkip$;
  this.$keyboard$.reset();
  this.$ui$.reset();
  this.$vdp$.reset();
  this.ports.reset();
  this.$cpu$.reset();
  this.$cpu$.$resetMemory$($JSCompiler_alias_NULL$$);
}, start: function $$JSSMS$$$$start$() {
  var $self$$1$$ = this;
  this.$isRunning$ || (this.$isRunning$ = $JSCompiler_alias_TRUE$$);
  this.$frameInterval$ = setInterval(function() {
    $self$$1$$.frame();
  }, 17);
  this.$resetFps$();
  this.$printFps$();
  this.$fpsInterval$ = setInterval(function() {
    $self$$1$$.$printFps$();
  }, 500);
}, stop: function $$JSSMS$$$$stop$() {
  clearInterval(this.$frameInterval$);
  clearInterval(this.$fpsInterval$);
  this.$isRunning$ = $JSCompiler_alias_FALSE$$;
}, frame: function $$JSSMS$$$$frame$() {
  this.$emulateNextFrame$() && this.$doRepaint$();
  this.$fpsFrameCount$++;
}, $emulateNextFrame$: function $$JSSMS$$$$$emulateNextFrame$$() {
  var $startTime$$2$$, $lineno$$;
  for ($lineno$$ = 0; $lineno$$ < this.$no_of_scanlines$; $lineno$$++) {
    $startTime$$2$$ = +new Date, 193 == $lineno$$ ? (this.$cpu$.$run$(this.$cyclesPerLine$, 8), this.$vdp$.$setVBlankFlag$(), this.$cpu$.$run$(0, 0)) : this.$cpu$.$run$(this.$cyclesPerLine$, 0), this.$z80TimeCounter$ += +new Date - $startTime$$2$$, this.$soundEnabled$ && this.$updateSound$($lineno$$), this.$vdp$.$line$ = $lineno$$, 0 == this.$frameskip_counter$ && 192 > $lineno$$ && ($startTime$$2$$ = +new Date, this.$vdp$.$drawLine$($lineno$$), this.$drawTimeCounter$ += +new Date - $startTime$$2$$),
    this.$vdp$.$interrupts$($lineno$$);
  }
  this.$soundEnabled$ && this.$audioOutput$(this.$audioBuffer$);
  60 == ++this.$frameCount$ && (this.$frameCount$ = this.$drawTimeCounter$ = this.$z80TimeCounter$ = 0);
  this.$pause_button$ && (this.$cpu$.$nmi$(), this.$pause_button$ = $JSCompiler_alias_FALSE$$);
  return 0 == this.$frameskip_counter$-- ? (this.$frameskip_counter$ = this.$frameSkip$, $JSCompiler_alias_TRUE$$) : $JSCompiler_alias_FALSE$$;
}, $setSMS$: function $$JSSMS$$$$$setSMS$$() {
  this.$is_sms$ = $JSCompiler_alias_TRUE$$;
  this.$is_gg$ = $JSCompiler_alias_FALSE$$;
  this.$vdp$.$h_start$ = 0;
  this.$vdp$.$h_end$ = 32;
}, $setGG$: function $$JSSMS$$$$$setGG$$() {
  this.$is_gg$ = $JSCompiler_alias_TRUE$$;
  this.$is_sms$ = $JSCompiler_alias_FALSE$$;
  this.$vdp$.$h_start$ = 5;
  this.$vdp$.$h_end$ = 27;
}, $setVideoTiming$: function $$JSSMS$$$$$setVideoTiming$$($i$$1_mode$$8$$) {
  var $clockSpeedHz_v$$ = 0;
  0 == $i$$1_mode$$8$$ || this.$is_gg$ ? (this.$fps$ = 60, this.$no_of_scanlines$ = 262, $clockSpeedHz_v$$ = 3579545) : 1 == $i$$1_mode$$8$$ && (this.$fps$ = 50, this.$no_of_scanlines$ = 313, $clockSpeedHz_v$$ = 3546893);
  this.$cyclesPerLine$ = Math.round($clockSpeedHz_v$$ / this.$fps$ / this.$no_of_scanlines$ + 1);
  this.$vdp$.$videoMode$ = $i$$1_mode$$8$$;
  if (this.$soundEnabled$) {
    this.$psg$.$init$($clockSpeedHz_v$$, 44100);
    this.$samplesPerFrame$ = Math.round(44100 / this.$fps$);
    if (0 == this.$audioBuffer$.length || this.$audioBuffer$.length != this.$samplesPerFrame$) {
      this.$audioBuffer$ = Array(this.$samplesPerFrame$);
    }
    if (0 == this.$samplesPerLine$.length || this.$samplesPerLine$.length != this.$no_of_scanlines$) {
      this.$samplesPerLine$ = Array(this.$no_of_scanlines$);
      for (var $fractional$$ = 0, $i$$1_mode$$8$$ = 0; $i$$1_mode$$8$$ < this.$no_of_scanlines$; $i$$1_mode$$8$$++) {
        $clockSpeedHz_v$$ = (this.$samplesPerFrame$ << 16) / this.$no_of_scanlines$ + $fractional$$, $fractional$$ = $clockSpeedHz_v$$ - ($clockSpeedHz_v$$ >> 16 << 16), this.$samplesPerLine$[$i$$1_mode$$8$$] = $clockSpeedHz_v$$ >> 16;
      }
    }
  }
}, $audioOutput$: function $$JSSMS$$$$$audioOutput$$($buffer$$9$$) {
  this.$ui$.$writeAudio$($buffer$$9$$);
}, $doRepaint$: function $$JSSMS$$$$$doRepaint$$() {
  this.$ui$.$writeFrame$(this.$vdp$.display, []);
}, $printFps$: function $$JSSMS$$$$$printFps$$() {
  var $now$$ = +new Date, $s$$2$$ = 'Running';
  this.$lastFpsTime$ && ($s$$2$$ += ': ' + (this.$fpsFrameCount$ / (($now$$ - this.$lastFpsTime$) / 1E3)).toFixed(2) + ' (/ ' + (1E3 / 17).toFixed(2) + ') FPS');
  this.$ui$.updateStatus($s$$2$$);
  this.$fpsFrameCount$ = 0;
  this.$lastFpsTime$ = $now$$;
}, $resetFps$: function $$JSSMS$$$$$resetFps$$() {
  this.$lastFpsTime$ = $JSCompiler_alias_NULL$$;
  this.$fpsFrameCount$ = 0;
}, $updateSound$: function $$JSSMS$$$$$updateSound$$($line_samplesToGenerate$$) {
  0 == $line_samplesToGenerate$$ && (this.$audioBufferOffset$ = 0);
  $line_samplesToGenerate$$ = this.$samplesPerLine$[$line_samplesToGenerate$$];
  this.$audioBuffer$ = this.$psg$.update(this.$audioBuffer$, this.$audioBufferOffset$, $line_samplesToGenerate$$);
  this.$audioBufferOffset$ += $line_samplesToGenerate$$;
}, $readRomDirectly$: function $$JSSMS$$$$$readRomDirectly$$($data$$30$$, $fileName$$) {
  var $mode$$9_pages$$;
  $mode$$9_pages$$ = '.gg' === $fileName$$.substr(-3).toLowerCase() ? 2 : 1;
  var $size$$9$$ = $data$$30$$.length;
  1 == $mode$$9_pages$$ ? this.$setSMS$() : 2 == $mode$$9_pages$$ && this.$setGG$();
  if (1024 >= $size$$9$$) {
    return $JSCompiler_alias_FALSE$$;
  }
  $mode$$9_pages$$ = this.$loadROM$($data$$30$$, $size$$9$$);
  if ($mode$$9_pages$$ == $JSCompiler_alias_NULL$$) {
    return $JSCompiler_alias_FALSE$$;
  }
  this.$cpu$.$resetMemory$($mode$$9_pages$$);
  this.$romData$ = $data$$30$$;
  this.$romFileName$ = $fileName$$;
  return $JSCompiler_alias_TRUE$$;
}, $loadROM$: function $$JSSMS$$$$$loadROM$$($data$$31$$, $size$$10$$) {
  0 != $size$$10$$ % 1024 && ($data$$31$$ = $data$$31$$.substr(512), $size$$10$$ -= 512);
  var $i$$2$$, $j$$, $number_of_pages$$ = Math.round($size$$10$$ / 1024), $pages$$1$$ = Array($number_of_pages$$);
  for ($i$$2$$ = 0; $i$$2$$ < $number_of_pages$$; $i$$2$$++) {
    $pages$$1$$[$i$$2$$] = Array(1024);
    for ($j$$ = 0; 1024 > $j$$; $j$$++) {
      $pages$$1$$[$i$$2$$][$j$$] = $data$$31$$.charCodeAt(1024 * $i$$2$$ + $j$$) & 255;
    }
  }
  return $pages$$1$$;
}, $reloadRom$: function $$JSSMS$$$$$reloadRom$$() {
  return'' !== this.$romData$ && '' !== this.$romFileName$ ? this.$readRomDirectly$(this.$romData$, this.$romFileName$) : $JSCompiler_alias_FALSE$$;
}};
function $JSSMS$Utils$copyArray$$($src$$3$$) {
  if (undefined === $src$$3$$) {
    return [];
  }
  for (var $i$$4$$ = $src$$3$$.length, $dest$$1$$ = Array($i$$4$$); $i$$4$$--;) {
    'undefined' != typeof $src$$3$$[$i$$4$$] && ($dest$$1$$[$i$$4$$] = $src$$3$$[$i$$4$$]);
  }
  return $dest$$1$$;
}
function $JSSMS$Utils$getPrefix$$($arr$$16$$) {
  var $prefix$$2$$ = $JSCompiler_alias_FALSE$$;
  $arr$$16$$.some(function($prop$$4$$) {
    return $prop$$4$$ in document ? ($prefix$$2$$ = $prop$$4$$, $JSCompiler_alias_TRUE$$) : $JSCompiler_alias_FALSE$$;
  });
  return $prefix$$2$$;
}
;var $OP_STATES$$ = [4, 10, 7, 6, 4, 4, 7, 4, 4, 11, 7, 6, 4, 4, 7, 4, 8, 10, 7, 6, 4, 4, 7, 4, 12, 11, 7, 6, 4, 4, 7, 4, 7, 10, 16, 6, 4, 4, 7, 4, 7, 11, 16, 6, 4, 4, 7, 4, 7, 10, 13, 6, 11, 11, 10, 4, 7, 11, 13, 6, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 7, 7, 7, 7, 7, 7, 4, 7, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4,
  4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4, 5, 10, 10, 10, 10, 11, 7, 11, 5, 10, 10, 0, 10, 17, 7, 11, 5, 10, 10, 11, 10, 11, 7, 11, 5, 4, 10, 11, 10, 0, 7, 11, 5, 10, 10, 19, 10, 11, 7, 11, 5, 4, 10, 4, 10, 0, 7, 11, 5, 10, 10, 4, 10, 11, 7, 11, 5, 6, 10, 4, 10, 0, 7, 11], $OP_CB_STATES$$ = [8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8,
  8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8,
  15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8], $OP_DD_STATES$$ = [4, 4, 4, 4, 4, 4, 4, 4, 4, 15, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 15, 4, 4, 4, 4, 4, 4, 4, 14, 20, 10, 8, 8, 11, 4, 4, 15, 20, 10, 8, 8, 11, 4, 4, 4, 4, 4, 23, 23, 19, 4, 4, 15, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 8, 8, 19, 4, 8, 8, 8, 8, 8, 8,
  19, 8, 8, 8, 8, 8, 8, 8, 19, 8, 19, 19, 19, 19, 19, 19, 4, 19, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 8, 8, 19, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 14, 4, 23, 4, 15, 4, 4, 4, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 10, 4, 4, 4, 4, 4, 4], $OP_INDEX_CB_STATES$$ =
    [0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0,
      0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 23, 0], $OP_ED_STATES$$ = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
      8, 8, 8, 12, 12, 15, 20, 8, 14, 8, 9, 12, 12, 15, 20, 8, 14, 8, 9, 12, 12, 15, 20, 8, 14, 8, 9, 12, 12, 15, 20, 8, 14, 8, 9, 12, 12, 15, 20, 8, 14, 8, 18, 12, 12, 15, 20, 8, 14, 8, 18, 8, 12, 15, 20, 8, 14, 8, 8, 12, 12, 15, 20, 8, 14, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 16, 16, 16, 16, 8, 8, 8, 8, 16, 16, 16, 16, 8, 8, 8, 8, 16, 16, 16, 16, 8, 8, 8, 8, 16, 16, 16, 16, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
      8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
function $JSSMS$Z80$$($sms$$) {
  this.$main$ = $sms$$;
  this.port = $sms$$.ports;
  this.$im$ = this.$sp$ = this.$pc$ = 0;
  this.$interruptLine$ = this.$EI_inst$ = this.$halt$ = this.$iff2$ = this.$iff1$ = $JSCompiler_alias_FALSE$$;
  this.$tstates$ = this.$f2$ = this.$f$ = this.$i$ = this.$iyH$ = this.$iyL$ = this.$ixH$ = this.$ixL$ = this.$l2$ = this.$h2$ = this.$l$ = this.$h$ = this.$e2$ = this.$d2$ = this.$e$ = this.$d$ = this.$c2$ = this.$b2$ = this.$c$ = this.$b$ = this.$a2$ = this.$a$ = this.$interruptVector$ = 0;
  this.$rom$ = [];
  this.$ram$ = Array(8);
  this.$sram$ = $JSCompiler_alias_NULL$$;
  this.$frameReg$ = Array(4);
  this.$number_of_pages$ = 0;
  this.$memWriteMap$ = Array(65);
  this.$memReadMap$ = Array(65);
  this.$DAA_TABLE$ = [];
  this.$SZ_TABLE$ = [];
  this.$SZP_TABLE$ = [];
  this.$SZHV_INC_TABLE$ = [];
  this.$SZHV_DEC_TABLE$ = [];
  this.$SZHVC_ADD_TABLE$ = [];
  this.$SZHVC_SUB_TABLE$ = [];
  this.$SZ_BIT_TABLE$ = [];
  this.$generateFlagTables$();
  this.$generateDAATable$();
  this.$generateMemory$();
}
$JSSMS$Z80$$.prototype = {reset: function $$JSSMS$Z80$$$$reset$() {
  this.$pc$ = this.$f2$ = this.$f$ = this.$i$ = this.$iyL$ = this.$iyH$ = this.$ixL$ = this.$ixH$ = this.$h$ = this.$l$ = this.$h2$ = this.$l2$ = this.$d$ = this.$e$ = this.$d2$ = this.$e2$ = this.$b$ = this.$c$ = this.$b2$ = this.$c2$ = this.$a$ = this.$a2$ = 0;
  this.$sp$ = 57328;
  this.$im$ = this.$tstates$ = 0;
  this.$EI_inst$ = this.$iff2$ = this.$iff1$ = $JSCompiler_alias_FALSE$$;
  this.$interruptVector$ = 0;
  this.$halt$ = $JSCompiler_alias_FALSE$$;
}, $run$: function $$JSSMS$Z80$$$$$run$$($cycles$$, $cyclesTo$$) {
  for (this.$tstates$ += $cycles$$; this.$tstates$ > $cyclesTo$$;) {
    this.$interruptLine$ && this.$interrupt$();
    var $location$$21_opcode$$2_temp$$ = this.$readMem$(this.$pc$++);
    this.$EI_inst$ = $JSCompiler_alias_FALSE$$;
    this.$tstates$ -= $OP_STATES$$[$location$$21_opcode$$2_temp$$];
    switch ($location$$21_opcode$$2_temp$$) {
      case 1:
        this.$c$ = this.$readMem$(this.$pc$++);
        this.$b$ = this.$readMem$(this.$pc$++);
        break;
      case 2:
        this.$writeMem$(this.$getBC$(), this.$a$);
        break;
      case 3:
        this.$incBC$();
        break;
      case 4:
        this.$b$ = this.$inc8$(this.$b$);
        break;
      case 5:
        this.$b$ = this.$dec8$(this.$b$);
        break;
      case 6:
        this.$b$ = this.$readMem$(this.$pc$++);
        break;
      case 7:
        this.$rlca_a$();
        break;
      case 8:
        this.$exAF$();
        break;
      case 9:
        this.$setHL$(this.$add16$(this.$getHL$(), this.$getBC$()));
        break;
      case 10:
        this.$a$ = this.$readMem$(this.$getBC$());
        break;
      case 11:
        this.$decBC$();
        break;
      case 12:
        this.$c$ = this.$inc8$(this.$c$);
        break;
      case 13:
        this.$c$ = this.$dec8$(this.$c$);
        break;
      case 14:
        this.$c$ = this.$readMem$(this.$pc$++);
        break;
      case 15:
        this.$rrca_a$();
        break;
      case 16:
        this.$b$ = this.$b$ - 1 & 255;
        this.$jr$(0 != this.$b$);
        break;
      case 17:
        this.$e$ = this.$readMem$(this.$pc$++);
        this.$d$ = this.$readMem$(this.$pc$++);
        break;
      case 18:
        this.$writeMem$(this.$getDE$(), this.$a$);
        break;
      case 19:
        this.$incDE$();
        break;
      case 20:
        this.$d$ = this.$inc8$(this.$d$);
        break;
      case 21:
        this.$d$ = this.$dec8$(this.$d$);
        break;
      case 22:
        this.$d$ = this.$readMem$(this.$pc$++);
        break;
      case 23:
        this.$rla_a$();
        break;
      case 24:
        this.$pc$ += this.$d_$() + 1;
        break;
      case 25:
        this.$setHL$(this.$add16$(this.$getHL$(), this.$getDE$()));
        break;
      case 26:
        this.$a$ = this.$readMem$(this.$getDE$());
        break;
      case 27:
        this.$decDE$();
        break;
      case 28:
        this.$e$ = this.$inc8$(this.$e$);
        break;
      case 29:
        this.$e$ = this.$dec8$(this.$e$);
        break;
      case 30:
        this.$e$ = this.$readMem$(this.$pc$++);
        break;
      case 31:
        this.$rra_a$();
        break;
      case 32:
        this.$jr$(0 == (this.$f$ & 64));
        break;
      case 33:
        this.$l$ = this.$readMem$(this.$pc$++);
        this.$h$ = this.$readMem$(this.$pc$++);
        break;
      case 34:
        $location$$21_opcode$$2_temp$$ = this.$readMemWord$(this.$pc$);
        this.$writeMem$($location$$21_opcode$$2_temp$$, this.$l$);
        this.$writeMem$(++$location$$21_opcode$$2_temp$$, this.$h$);
        this.$pc$ += 2;
        break;
      case 35:
        this.$incHL$();
        break;
      case 36:
        this.$h$ = this.$inc8$(this.$h$);
        break;
      case 37:
        this.$h$ = this.$dec8$(this.$h$);
        break;
      case 38:
        this.$h$ = this.$readMem$(this.$pc$++);
        break;
      case 39:
        this.$daa$();
        break;
      case 40:
        this.$jr$(0 != (this.$f$ & 64));
        break;
      case 41:
        this.$setHL$(this.$add16$(this.$getHL$(), this.$getHL$()));
        break;
      case 42:
        $location$$21_opcode$$2_temp$$ = this.$readMemWord$(this.$pc$);
        this.$l$ = this.$readMem$($location$$21_opcode$$2_temp$$);
        this.$h$ = this.$readMem$($location$$21_opcode$$2_temp$$ + 1);
        this.$pc$ += 2;
        break;
      case 43:
        this.$decHL$();
        break;
      case 44:
        this.$l$ = this.$inc8$(this.$l$);
        break;
      case 45:
        this.$l$ = this.$dec8$(this.$l$);
        break;
      case 46:
        this.$l$ = this.$readMem$(this.$pc$++);
        break;
      case 47:
        this.$cpl_a$();
        break;
      case 48:
        this.$jr$(0 == (this.$f$ & 1));
        break;
      case 49:
        this.$sp$ = this.$readMemWord$(this.$pc$);
        this.$pc$ += 2;
        break;
      case 50:
        this.$writeMem$(this.$readMemWord$(this.$pc$), this.$a$);
        this.$pc$ += 2;
        break;
      case 51:
        this.$sp$++;
        break;
      case 52:
        this.$incMem$(this.$getHL$());
        break;
      case 53:
        this.$decMem$(this.$getHL$());
        break;
      case 54:
        this.$writeMem$(this.$getHL$(), this.$readMem$(this.$pc$++));
        break;
      case 55:
        this.$f$ |= 1;
        this.$f$ &= -3;
        this.$f$ &= -17;
        break;
      case 56:
        this.$jr$(0 != (this.$f$ & 1));
        break;
      case 57:
        this.$setHL$(this.$add16$(this.$getHL$(), this.$sp$));
        break;
      case 58:
        this.$a$ = this.$readMem$(this.$readMemWord$(this.$pc$));
        this.$pc$ += 2;
        break;
      case 59:
        this.$sp$--;
        break;
      case 60:
        this.$a$ = this.$inc8$(this.$a$);
        break;
      case 61:
        this.$a$ = this.$dec8$(this.$a$);
        break;
      case 62:
        this.$a$ = this.$readMem$(this.$pc$++);
        break;
      case 63:
        this.$ccf$();
        break;
      case 65:
        this.$b$ = this.$c$;
        break;
      case 66:
        this.$b$ = this.$d$;
        break;
      case 67:
        this.$b$ = this.$e$;
        break;
      case 68:
        this.$b$ = this.$h$;
        break;
      case 69:
        this.$b$ = this.$l$;
        break;
      case 70:
        this.$b$ = this.$readMem$(this.$getHL$());
        break;
      case 71:
        this.$b$ = this.$a$;
        break;
      case 72:
        this.$c$ = this.$b$;
        break;
      case 74:
        this.$c$ = this.$d$;
        break;
      case 75:
        this.$c$ = this.$e$;
        break;
      case 76:
        this.$c$ = this.$h$;
        break;
      case 77:
        this.$c$ = this.$l$;
        break;
      case 78:
        this.$c$ = this.$readMem$(this.$getHL$());
        break;
      case 79:
        this.$c$ = this.$a$;
        break;
      case 80:
        this.$d$ = this.$b$;
        break;
      case 81:
        this.$d$ = this.$c$;
        break;
      case 83:
        this.$d$ = this.$e$;
        break;
      case 84:
        this.$d$ = this.$h$;
        break;
      case 85:
        this.$d$ = this.$l$;
        break;
      case 86:
        this.$d$ = this.$readMem$(this.$getHL$());
        break;
      case 87:
        this.$d$ = this.$a$;
        break;
      case 88:
        this.$e$ = this.$b$;
        break;
      case 89:
        this.$e$ = this.$c$;
        break;
      case 90:
        this.$e$ = this.$d$;
        break;
      case 92:
        this.$e$ = this.$h$;
        break;
      case 93:
        this.$e$ = this.$l$;
        break;
      case 94:
        this.$e$ = this.$readMem$(this.$getHL$());
        break;
      case 95:
        this.$e$ = this.$a$;
        break;
      case 96:
        this.$h$ = this.$b$;
        break;
      case 97:
        this.$h$ = this.$c$;
        break;
      case 98:
        this.$h$ = this.$d$;
        break;
      case 99:
        this.$h$ = this.$e$;
        break;
      case 101:
        this.$h$ = this.$l$;
        break;
      case 102:
        this.$h$ = this.$readMem$(this.$getHL$());
        break;
      case 103:
        this.$h$ = this.$a$;
        break;
      case 104:
        this.$l$ = this.$b$;
        break;
      case 105:
        this.$l$ = this.$c$;
        break;
      case 106:
        this.$l$ = this.$d$;
        break;
      case 107:
        this.$l$ = this.$e$;
        break;
      case 108:
        this.$l$ = this.$h$;
        break;
      case 110:
        this.$l$ = this.$readMem$(this.$getHL$());
        break;
      case 111:
        this.$l$ = this.$a$;
        break;
      case 112:
        this.$writeMem$(this.$getHL$(), this.$b$);
        break;
      case 113:
        this.$writeMem$(this.$getHL$(), this.$c$);
        break;
      case 114:
        this.$writeMem$(this.$getHL$(), this.$d$);
        break;
      case 115:
        this.$writeMem$(this.$getHL$(), this.$e$);
        break;
      case 116:
        this.$writeMem$(this.$getHL$(), this.$h$);
        break;
      case 117:
        this.$writeMem$(this.$getHL$(), this.$l$);
        break;
      case 118:
        this.$halt$ = $JSCompiler_alias_TRUE$$;
        this.$pc$--;
        break;
      case 119:
        this.$writeMem$(this.$getHL$(), this.$a$);
        break;
      case 120:
        this.$a$ = this.$b$;
        break;
      case 121:
        this.$a$ = this.$c$;
        break;
      case 122:
        this.$a$ = this.$d$;
        break;
      case 123:
        this.$a$ = this.$e$;
        break;
      case 124:
        this.$a$ = this.$h$;
        break;
      case 125:
        this.$a$ = this.$l$;
        break;
      case 126:
        this.$a$ = this.$readMem$(this.$getHL$());
        break;
      case 128:
        this.$add_a$(this.$b$);
        break;
      case 129:
        this.$add_a$(this.$c$);
        break;
      case 130:
        this.$add_a$(this.$d$);
        break;
      case 131:
        this.$add_a$(this.$e$);
        break;
      case 132:
        this.$add_a$(this.$h$);
        break;
      case 133:
        this.$add_a$(this.$l$);
        break;
      case 134:
        this.$add_a$(this.$readMem$(this.$getHL$()));
        break;
      case 135:
        this.$add_a$(this.$a$);
        break;
      case 136:
        this.$adc_a$(this.$b$);
        break;
      case 137:
        this.$adc_a$(this.$c$);
        break;
      case 138:
        this.$adc_a$(this.$d$);
        break;
      case 139:
        this.$adc_a$(this.$e$);
        break;
      case 140:
        this.$adc_a$(this.$h$);
        break;
      case 141:
        this.$adc_a$(this.$l$);
        break;
      case 142:
        this.$adc_a$(this.$readMem$(this.$getHL$()));
        break;
      case 143:
        this.$adc_a$(this.$a$);
        break;
      case 144:
        this.$sub_a$(this.$b$);
        break;
      case 145:
        this.$sub_a$(this.$c$);
        break;
      case 146:
        this.$sub_a$(this.$d$);
        break;
      case 147:
        this.$sub_a$(this.$e$);
        break;
      case 148:
        this.$sub_a$(this.$h$);
        break;
      case 149:
        this.$sub_a$(this.$l$);
        break;
      case 150:
        this.$sub_a$(this.$readMem$(this.$getHL$()));
        break;
      case 151:
        this.$sub_a$(this.$a$);
        break;
      case 152:
        this.$sbc_a$(this.$b$);
        break;
      case 153:
        this.$sbc_a$(this.$c$);
        break;
      case 154:
        this.$sbc_a$(this.$d$);
        break;
      case 155:
        this.$sbc_a$(this.$e$);
        break;
      case 156:
        this.$sbc_a$(this.$h$);
        break;
      case 157:
        this.$sbc_a$(this.$l$);
        break;
      case 158:
        this.$sbc_a$(this.$readMem$(this.$getHL$()));
        break;
      case 159:
        this.$sbc_a$(this.$a$);
        break;
      case 160:
        this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$b$] | 16;
        break;
      case 161:
        this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$c$] | 16;
        break;
      case 162:
        this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$d$] | 16;
        break;
      case 163:
        this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$e$] | 16;
        break;
      case 164:
        this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$h$] | 16;
        break;
      case 165:
        this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$l$] | 16;
        break;
      case 166:
        this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$readMem$(this.$getHL$())] | 16;
        break;
      case 167:
        this.$f$ = this.$SZP_TABLE$[this.$a$] | 16;
        break;
      case 168:
        this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$b$];
        break;
      case 169:
        this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$c$];
        break;
      case 170:
        this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$d$];
        break;
      case 171:
        this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$e$];
        break;
      case 172:
        this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$h$];
        break;
      case 173:
        this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$l$];
        break;
      case 174:
        this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$readMem$(this.$getHL$())];
        break;
      case 175:
        this.$f$ = this.$SZP_TABLE$[this.$a$ = 0];
        break;
      case 176:
        this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$b$];
        break;
      case 177:
        this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$c$];
        break;
      case 178:
        this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$d$];
        break;
      case 179:
        this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$e$];
        break;
      case 180:
        this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$h$];
        break;
      case 181:
        this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$l$];
        break;
      case 182:
        this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$readMem$(this.$getHL$())];
        break;
      case 183:
        this.$f$ = this.$SZP_TABLE$[this.$a$];
        break;
      case 184:
        this.$cp_a$(this.$b$);
        break;
      case 185:
        this.$cp_a$(this.$c$);
        break;
      case 186:
        this.$cp_a$(this.$d$);
        break;
      case 187:
        this.$cp_a$(this.$e$);
        break;
      case 188:
        this.$cp_a$(this.$h$);
        break;
      case 189:
        this.$cp_a$(this.$l$);
        break;
      case 190:
        this.$cp_a$(this.$readMem$(this.$getHL$()));
        break;
      case 191:
        this.$cp_a$(this.$a$);
        break;
      case 192:
        this.$ret$(0 == (this.$f$ & 64));
        break;
      case 193:
        this.$setBC$(this.$readMemWord$(this.$sp$));
        this.$sp$ += 2;
        break;
      case 194:
        this.$jp$(0 == (this.$f$ & 64));
        break;
      case 195:
        this.$pc$ = this.$readMemWord$(this.$pc$);
        break;
      case 196:
        this.call(0 == (this.$f$ & 64));
        break;
      case 197:
        this.push(this.$b$, this.$c$);
        break;
      case 198:
        this.$add_a$(this.$readMem$(this.$pc$++));
        break;
      case 199:
        this.push(this.$pc$);
        this.$pc$ = 0;
        break;
      case 200:
        this.$ret$(0 != (this.$f$ & 64));
        break;
      case 201:
        this.$pc$ = this.$readMemWord$(this.$sp$);
        this.$sp$ += 2;
        break;
      case 202:
        this.$jp$(0 != (this.$f$ & 64));
        break;
      case 203:
        this.$doCB$(this.$readMem$(this.$pc$++));
        break;
      case 204:
        this.call(0 != (this.$f$ & 64));
        break;
      case 205:
        this.push(this.$pc$ + 2);
        this.$pc$ = this.$readMemWord$(this.$pc$);
        break;
      case 206:
        this.$adc_a$(this.$readMem$(this.$pc$++));
        break;
      case 207:
        this.push(this.$pc$);
        this.$pc$ = 8;
        break;
      case 208:
        this.$ret$(0 == (this.$f$ & 1));
        break;
      case 209:
        this.$setDE$(this.$readMemWord$(this.$sp$));
        this.$sp$ += 2;
        break;
      case 210:
        this.$jp$(0 == (this.$f$ & 1));
        break;
      case 211:
        this.port.$out$(this.$readMem$(this.$pc$++), this.$a$);
        break;
      case 212:
        this.call(0 == (this.$f$ & 1));
        break;
      case 213:
        this.push(this.$d$, this.$e$);
        break;
      case 214:
        this.$sub_a$(this.$readMem$(this.$pc$++));
        break;
      case 215:
        this.push(this.$pc$);
        this.$pc$ = 16;
        break;
      case 216:
        this.$ret$(0 != (this.$f$ & 1));
        break;
      case 217:
        this.$exBC$();
        this.$exDE$();
        this.$exHL$();
        break;
      case 218:
        this.$jp$(0 != (this.$f$ & 1));
        break;
      case 219:
        this.$a$ = this.port.$in_$(this.$readMem$(this.$pc$++));
        break;
      case 220:
        this.call(0 != (this.$f$ & 1));
        break;
      case 221:
        this.$doIndexOpIX$(this.$readMem$(this.$pc$++));
        break;
      case 222:
        this.$sbc_a$(this.$readMem$(this.$pc$++));
        break;
      case 223:
        this.push(this.$pc$);
        this.$pc$ = 24;
        break;
      case 224:
        this.$ret$(0 == (this.$f$ & 4));
        break;
      case 225:
        this.$setHL$(this.$readMemWord$(this.$sp$));
        this.$sp$ += 2;
        break;
      case 226:
        this.$jp$(0 == (this.$f$ & 4));
        break;
      case 227:
        $location$$21_opcode$$2_temp$$ = this.$h$;
        this.$h$ = this.$readMem$(this.$sp$ + 1);
        this.$writeMem$(this.$sp$ + 1, $location$$21_opcode$$2_temp$$);
        $location$$21_opcode$$2_temp$$ = this.$l$;
        this.$l$ = this.$readMem$(this.$sp$);
        this.$writeMem$(this.$sp$, $location$$21_opcode$$2_temp$$);
        break;
      case 228:
        this.call(0 == (this.$f$ & 4));
        break;
      case 229:
        this.push(this.$h$, this.$l$);
        break;
      case 230:
        this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$readMem$(this.$pc$++)] | 16;
        break;
      case 231:
        this.push(this.$pc$);
        this.$pc$ = 32;
        break;
      case 232:
        this.$ret$(0 != (this.$f$ & 4));
        break;
      case 233:
        this.$pc$ = this.$getHL$();
        break;
      case 234:
        this.$jp$(0 != (this.$f$ & 4));
        break;
      case 235:
        $location$$21_opcode$$2_temp$$ = this.$d$;
        this.$d$ = this.$h$;
        this.$h$ = $location$$21_opcode$$2_temp$$;
        $location$$21_opcode$$2_temp$$ = this.$e$;
        this.$e$ = this.$l$;
        this.$l$ = $location$$21_opcode$$2_temp$$;
        break;
      case 236:
        this.call(0 != (this.$f$ & 4));
        break;
      case 237:
        this.$doED$(this.$readMem$(this.$pc$));
        break;
      case 238:
        this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$readMem$(this.$pc$++)];
        break;
      case 239:
        this.push(this.$pc$);
        this.$pc$ = 40;
        break;
      case 240:
        this.$ret$(0 == (this.$f$ & 128));
        break;
      case 241:
        this.$f$ = this.$readMem$(this.$sp$++);
        this.$a$ = this.$readMem$(this.$sp$++);
        break;
      case 242:
        this.$jp$(0 == (this.$f$ & 128));
        break;
      case 243:
        this.$iff1$ = this.$iff2$ = $JSCompiler_alias_FALSE$$;
        this.$EI_inst$ = $JSCompiler_alias_TRUE$$;
        break;
      case 244:
        this.call(0 == (this.$f$ & 128));
        break;
      case 245:
        this.push(this.$a$, this.$f$);
        break;
      case 246:
        this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$readMem$(this.$pc$++)];
        break;
      case 247:
        this.push(this.$pc$);
        this.$pc$ = 48;
        break;
      case 248:
        this.$ret$(0 != (this.$f$ & 128));
        break;
      case 249:
        this.$sp$ = this.$getHL$();
        break;
      case 250:
        this.$jp$(0 != (this.$f$ & 128));
        break;
      case 251:
        this.$iff1$ = this.$iff2$ = this.$EI_inst$ = $JSCompiler_alias_TRUE$$;
        break;
      case 252:
        this.call(0 != (this.$f$ & 128));
        break;
      case 253:
        this.$doIndexOpIY$(this.$readMem$(this.$pc$++));
        break;
      case 254:
        this.$cp_a$(this.$readMem$(this.$pc$++));
        break;
      case 255:
        this.push(this.$pc$), this.$pc$ = 56;
    }
  }
}, $nmi$: function $$JSSMS$Z80$$$$$nmi$$() {
  this.$iff2$ = this.$iff1$;
  this.$iff1$ = $JSCompiler_alias_FALSE$$;
  this.$halt$ && (this.$pc$++, this.$halt$ = $JSCompiler_alias_FALSE$$);
  this.push(this.$pc$);
  this.$pc$ = 102;
  this.$tstates$ -= 11;
}, $interrupt$: function $$JSSMS$Z80$$$$$interrupt$$() {
  this.$iff1$ && !this.$EI_inst$ && ((this.$halt$ && (this.$pc$++, this.$halt$ = $JSCompiler_alias_FALSE$$), this.$interruptLine$ = this.$iff1$ = this.$iff2$ = $JSCompiler_alias_FALSE$$, this.push(this.$pc$), 0 == this.$im$) ? (this.$pc$ = 0 == this.$interruptVector$ || 255 == this.$interruptVector$ ? 56 : this.$interruptVector$, this.$tstates$ -= 13) : 1 == this.$im$ ? (this.$pc$ = 56, this.$tstates$ -= 13) : (this.$pc$ = this.$readMemWord$((this.$i$ << 8) + this.$interruptVector$), this.$tstates$ -=
      19));
}, $jp$: function $$JSSMS$Z80$$$$$jp$$($condition$$1$$) {
  this.$pc$ = $condition$$1$$ ? this.$readMemWord$(this.$pc$) : this.$pc$ + 2;
}, $jr$: function $$JSSMS$Z80$$$$$jr$$($condition$$2_d$$) {
  $condition$$2_d$$ ? ($condition$$2_d$$ = this.$d_$() + 1, this.$pc$ += 128 > $condition$$2_d$$ ? $condition$$2_d$$ : $condition$$2_d$$ - 256, this.$tstates$ -= 5) : this.$pc$++;
}, call: function $$JSSMS$Z80$$$$call$($condition$$3$$) {
  $condition$$3$$ ? (this.push(this.$pc$ + 2), this.$pc$ = this.$readMemWord$(this.$pc$), this.$tstates$ -= 7) : this.$pc$ += 2;
}, $ret$: function $$JSSMS$Z80$$$$$ret$$($condition$$4$$) {
  $condition$$4$$ && (this.$pc$ = this.$readMemWord$(this.$sp$), this.$sp$ += 2, this.$tstates$ -= 6);
}, push: function $$JSSMS$Z80$$$$push$($value$$51$$, $l$$) {
  'undefined' === typeof $l$$ ? (this.$writeMem$(--this.$sp$, $value$$51$$ >> 8), this.$writeMem$(--this.$sp$, $value$$51$$ & 255)) : (this.$writeMem$(--this.$sp$, $value$$51$$), this.$writeMem$(--this.$sp$, $l$$));
}, $incMem$: function $$JSSMS$Z80$$$$$incMem$$($offset$$14$$) {
  this.$writeMem$($offset$$14$$, this.$inc8$(this.$readMem$($offset$$14$$)));
}, $decMem$: function $$JSSMS$Z80$$$$$decMem$$($offset$$15$$) {
  this.$writeMem$($offset$$15$$, this.$dec8$(this.$readMem$($offset$$15$$)));
}, $ccf$: function $$JSSMS$Z80$$$$$ccf$$() {
  0 != (this.$f$ & 1) ? (this.$f$ &= -2, this.$f$ |= 16) : (this.$f$ |= 1, this.$f$ &= -17);
  this.$f$ &= -3;
}, $daa$: function $$JSSMS$Z80$$$$$daa$$() {
  var $temp$$1$$ = this.$DAA_TABLE$[this.$a$ | (this.$f$ & 1) << 8 | (this.$f$ & 2) << 8 | (this.$f$ & 16) << 6];
  this.$a$ = $temp$$1$$ & 255;
  this.$f$ = this.$f$ & 2 | $temp$$1$$ >> 8;
}, $doCB$: function $$JSSMS$Z80$$$$$doCB$$($opcode$$3$$) {
  this.$tstates$ -= $OP_CB_STATES$$[$opcode$$3$$];
  switch ($opcode$$3$$) {
    case 0:
      this.$b$ = this.$rlc$(this.$b$);
      break;
    case 1:
      this.$c$ = this.$rlc$(this.$c$);
      break;
    case 2:
      this.$d$ = this.$rlc$(this.$d$);
      break;
    case 3:
      this.$e$ = this.$rlc$(this.$e$);
      break;
    case 4:
      this.$h$ = this.$rlc$(this.$h$);
      break;
    case 5:
      this.$l$ = this.$rlc$(this.$l$);
      break;
    case 6:
      this.$writeMem$(this.$getHL$(), this.$rlc$(this.$readMem$(this.$getHL$())));
      break;
    case 7:
      this.$a$ = this.$rlc$(this.$a$);
      break;
    case 8:
      this.$b$ = this.$rrc$(this.$b$);
      break;
    case 9:
      this.$c$ = this.$rrc$(this.$c$);
      break;
    case 10:
      this.$d$ = this.$rrc$(this.$d$);
      break;
    case 11:
      this.$e$ = this.$rrc$(this.$e$);
      break;
    case 12:
      this.$h$ = this.$rrc$(this.$h$);
      break;
    case 13:
      this.$l$ = this.$rrc$(this.$l$);
      break;
    case 14:
      this.$writeMem$(this.$getHL$(), this.$rrc$(this.$readMem$(this.$getHL$())));
      break;
    case 15:
      this.$a$ = this.$rrc$(this.$a$);
      break;
    case 16:
      this.$b$ = this.$rl$(this.$b$);
      break;
    case 17:
      this.$c$ = this.$rl$(this.$c$);
      break;
    case 18:
      this.$d$ = this.$rl$(this.$d$);
      break;
    case 19:
      this.$e$ = this.$rl$(this.$e$);
      break;
    case 20:
      this.$h$ = this.$rl$(this.$h$);
      break;
    case 21:
      this.$l$ = this.$rl$(this.$l$);
      break;
    case 22:
      this.$writeMem$(this.$getHL$(), this.$rl$(this.$readMem$(this.$getHL$())));
      break;
    case 23:
      this.$a$ = this.$rl$(this.$a$);
      break;
    case 24:
      this.$b$ = this.$rr$(this.$b$);
      break;
    case 25:
      this.$c$ = this.$rr$(this.$c$);
      break;
    case 26:
      this.$d$ = this.$rr$(this.$d$);
      break;
    case 27:
      this.$e$ = this.$rr$(this.$e$);
      break;
    case 28:
      this.$h$ = this.$rr$(this.$h$);
      break;
    case 29:
      this.$l$ = this.$rr$(this.$l$);
      break;
    case 30:
      this.$writeMem$(this.$getHL$(), this.$rr$(this.$readMem$(this.$getHL$())));
      break;
    case 31:
      this.$a$ = this.$rr$(this.$a$);
      break;
    case 32:
      this.$b$ = this.$sla$(this.$b$);
      break;
    case 33:
      this.$c$ = this.$sla$(this.$c$);
      break;
    case 34:
      this.$d$ = this.$sla$(this.$d$);
      break;
    case 35:
      this.$e$ = this.$sla$(this.$e$);
      break;
    case 36:
      this.$h$ = this.$sla$(this.$h$);
      break;
    case 37:
      this.$l$ = this.$sla$(this.$l$);
      break;
    case 38:
      this.$writeMem$(this.$getHL$(), this.$sla$(this.$readMem$(this.$getHL$())));
      break;
    case 39:
      this.$a$ = this.$sla$(this.$a$);
      break;
    case 40:
      this.$b$ = this.$sra$(this.$b$);
      break;
    case 41:
      this.$c$ = this.$sra$(this.$c$);
      break;
    case 42:
      this.$d$ = this.$sra$(this.$d$);
      break;
    case 43:
      this.$e$ = this.$sra$(this.$e$);
      break;
    case 44:
      this.$h$ = this.$sra$(this.$h$);
      break;
    case 45:
      this.$l$ = this.$sra$(this.$l$);
      break;
    case 46:
      this.$writeMem$(this.$getHL$(), this.$sra$(this.$readMem$(this.$getHL$())));
      break;
    case 47:
      this.$a$ = this.$sra$(this.$a$);
      break;
    case 48:
      this.$b$ = this.$sll$(this.$b$);
      break;
    case 49:
      this.$c$ = this.$sll$(this.$c$);
      break;
    case 50:
      this.$d$ = this.$sll$(this.$d$);
      break;
    case 51:
      this.$e$ = this.$sll$(this.$e$);
      break;
    case 52:
      this.$h$ = this.$sll$(this.$h$);
      break;
    case 53:
      this.$l$ = this.$sll$(this.$l$);
      break;
    case 54:
      this.$writeMem$(this.$getHL$(), this.$sll$(this.$readMem$(this.$getHL$())));
      break;
    case 55:
      this.$a$ = this.$sll$(this.$a$);
      break;
    case 56:
      this.$b$ = this.$srl$(this.$b$);
      break;
    case 57:
      this.$c$ = this.$srl$(this.$c$);
      break;
    case 58:
      this.$d$ = this.$srl$(this.$d$);
      break;
    case 59:
      this.$e$ = this.$srl$(this.$e$);
      break;
    case 60:
      this.$h$ = this.$srl$(this.$h$);
      break;
    case 61:
      this.$l$ = this.$rl$(this.$l$);
      break;
    case 62:
      this.$writeMem$(this.$getHL$(), this.$srl$(this.$readMem$(this.$getHL$())));
      break;
    case 63:
      this.$a$ = this.$srl$(this.$a$);
      break;
    case 64:
      this.$bit$(this.$b$ & 1);
      break;
    case 65:
      this.$bit$(this.$c$ & 1);
      break;
    case 66:
      this.$bit$(this.$d$ & 1);
      break;
    case 67:
      this.$bit$(this.$e$ & 1);
      break;
    case 68:
      this.$bit$(this.$h$ & 1);
      break;
    case 69:
      this.$bit$(this.$l$ & 1);
      break;
    case 70:
      this.$bit$(this.$readMem$(this.$getHL$()) & 1);
      break;
    case 71:
      this.$bit$(this.$a$ & 1);
      break;
    case 72:
      this.$bit$(this.$b$ & 2);
      break;
    case 73:
      this.$bit$(this.$c$ & 2);
      break;
    case 74:
      this.$bit$(this.$d$ & 2);
      break;
    case 75:
      this.$bit$(this.$e$ & 2);
      break;
    case 76:
      this.$bit$(this.$h$ & 2);
      break;
    case 77:
      this.$bit$(this.$l$ & 2);
      break;
    case 78:
      this.$bit$(this.$readMem$(this.$getHL$()) & 2);
      break;
    case 79:
      this.$bit$(this.$a$ & 2);
      break;
    case 80:
      this.$bit$(this.$b$ & 4);
      break;
    case 81:
      this.$bit$(this.$c$ & 4);
      break;
    case 82:
      this.$bit$(this.$d$ & 4);
      break;
    case 83:
      this.$bit$(this.$e$ & 4);
      break;
    case 84:
      this.$bit$(this.$h$ & 4);
      break;
    case 85:
      this.$bit$(this.$l$ & 4);
      break;
    case 86:
      this.$bit$(this.$readMem$(this.$getHL$()) & 4);
      break;
    case 87:
      this.$bit$(this.$a$ & 4);
      break;
    case 88:
      this.$bit$(this.$b$ & 8);
      break;
    case 89:
      this.$bit$(this.$c$ & 8);
      break;
    case 90:
      this.$bit$(this.$d$ & 8);
      break;
    case 91:
      this.$bit$(this.$e$ & 8);
      break;
    case 92:
      this.$bit$(this.$h$ & 8);
      break;
    case 93:
      this.$bit$(this.$l$ & 8);
      break;
    case 94:
      this.$bit$(this.$readMem$(this.$getHL$()) & 8);
      break;
    case 95:
      this.$bit$(this.$a$ & 8);
      break;
    case 96:
      this.$bit$(this.$b$ & 16);
      break;
    case 97:
      this.$bit$(this.$c$ & 16);
      break;
    case 98:
      this.$bit$(this.$d$ & 16);
      break;
    case 99:
      this.$bit$(this.$e$ & 16);
      break;
    case 100:
      this.$bit$(this.$h$ & 16);
      break;
    case 101:
      this.$bit$(this.$l$ & 16);
      break;
    case 102:
      this.$bit$(this.$readMem$(this.$getHL$()) & 16);
      break;
    case 103:
      this.$bit$(this.$a$ & 16);
      break;
    case 104:
      this.$bit$(this.$b$ & 32);
      break;
    case 105:
      this.$bit$(this.$c$ & 32);
      break;
    case 106:
      this.$bit$(this.$d$ & 32);
      break;
    case 107:
      this.$bit$(this.$e$ & 32);
      break;
    case 108:
      this.$bit$(this.$h$ & 32);
      break;
    case 109:
      this.$bit$(this.$l$ & 32);
      break;
    case 110:
      this.$bit$(this.$readMem$(this.$getHL$()) & 32);
      break;
    case 111:
      this.$bit$(this.$a$ & 32);
      break;
    case 112:
      this.$bit$(this.$b$ & 64);
      break;
    case 113:
      this.$bit$(this.$c$ & 64);
      break;
    case 114:
      this.$bit$(this.$d$ & 64);
      break;
    case 115:
      this.$bit$(this.$e$ & 64);
      break;
    case 116:
      this.$bit$(this.$h$ & 64);
      break;
    case 117:
      this.$bit$(this.$l$ & 64);
      break;
    case 118:
      this.$bit$(this.$readMem$(this.$getHL$()) & 64);
      break;
    case 119:
      this.$bit$(this.$a$ & 64);
      break;
    case 120:
      this.$bit$(this.$b$ & 128);
      break;
    case 121:
      this.$bit$(this.$c$ & 128);
      break;
    case 122:
      this.$bit$(this.$d$ & 128);
      break;
    case 123:
      this.$bit$(this.$e$ & 128);
      break;
    case 124:
      this.$bit$(this.$h$ & 128);
      break;
    case 125:
      this.$bit$(this.$l$ & 128);
      break;
    case 126:
      this.$bit$(this.$readMem$(this.$getHL$()) & 128);
      break;
    case 127:
      this.$bit$(this.$a$ & 128);
      break;
    case 128:
      this.$b$ &= -2;
      break;
    case 129:
      this.$c$ &= -2;
      break;
    case 130:
      this.$d$ &= -2;
      break;
    case 131:
      this.$e$ &= -2;
      break;
    case 132:
      this.$h$ &= -2;
      break;
    case 133:
      this.$l$ &= -2;
      break;
    case 134:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) & -2);
      break;
    case 135:
      this.$a$ &= -2;
      break;
    case 136:
      this.$b$ &= -3;
      break;
    case 137:
      this.$c$ &= -3;
      break;
    case 138:
      this.$d$ &= -3;
      break;
    case 139:
      this.$e$ &= -3;
      break;
    case 140:
      this.$h$ &= -3;
      break;
    case 141:
      this.$l$ &= -3;
      break;
    case 142:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) & -3);
      break;
    case 143:
      this.$a$ &= -3;
      break;
    case 144:
      this.$b$ &= -5;
      break;
    case 145:
      this.$c$ &= -5;
      break;
    case 146:
      this.$d$ &= -5;
      break;
    case 147:
      this.$e$ &= -5;
      break;
    case 148:
      this.$h$ &= -5;
      break;
    case 149:
      this.$l$ &= -5;
      break;
    case 150:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) & -5);
      break;
    case 151:
      this.$a$ &= -5;
      break;
    case 152:
      this.$b$ &= -9;
      break;
    case 153:
      this.$c$ &= -9;
      break;
    case 154:
      this.$d$ &= -9;
      break;
    case 155:
      this.$e$ &= -9;
      break;
    case 156:
      this.$h$ &= -9;
      break;
    case 157:
      this.$l$ &= -9;
      break;
    case 158:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) & -9);
      break;
    case 159:
      this.$a$ &= -9;
      break;
    case 160:
      this.$b$ &= -17;
      break;
    case 161:
      this.$c$ &= -17;
      break;
    case 162:
      this.$d$ &= -17;
      break;
    case 163:
      this.$e$ &= -17;
      break;
    case 164:
      this.$h$ &= -17;
      break;
    case 165:
      this.$l$ &= -17;
      break;
    case 166:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) & -17);
      break;
    case 167:
      this.$a$ &= -17;
      break;
    case 168:
      this.$b$ &= -33;
      break;
    case 169:
      this.$c$ &= -33;
      break;
    case 170:
      this.$d$ &= -33;
      break;
    case 171:
      this.$e$ &= -33;
      break;
    case 172:
      this.$h$ &= -33;
      break;
    case 173:
      this.$l$ &= -33;
      break;
    case 174:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) & -33);
      break;
    case 175:
      this.$a$ &= -33;
      break;
    case 176:
      this.$b$ &= -65;
      break;
    case 177:
      this.$c$ &= -65;
      break;
    case 178:
      this.$d$ &= -65;
      break;
    case 179:
      this.$e$ &= -65;
      break;
    case 180:
      this.$h$ &= -65;
      break;
    case 181:
      this.$l$ &= -65;
      break;
    case 182:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) & -65);
      break;
    case 183:
      this.$a$ &= -65;
      break;
    case 184:
      this.$b$ &= -129;
      break;
    case 185:
      this.$c$ &= -129;
      break;
    case 186:
      this.$d$ &= -129;
      break;
    case 187:
      this.$e$ &= -129;
      break;
    case 188:
      this.$h$ &= -129;
      break;
    case 189:
      this.$l$ &= -129;
      break;
    case 190:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) & -129);
      break;
    case 191:
      this.$a$ &= -129;
      break;
    case 192:
      this.$b$ |= 1;
      break;
    case 193:
      this.$c$ |= 1;
      break;
    case 194:
      this.$d$ |= 1;
      break;
    case 195:
      this.$e$ |= 1;
      break;
    case 196:
      this.$h$ |= 1;
      break;
    case 197:
      this.$l$ |= 1;
      break;
    case 198:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) | 1);
      break;
    case 199:
      this.$a$ |= 1;
      break;
    case 200:
      this.$b$ |= 2;
      break;
    case 201:
      this.$c$ |= 2;
      break;
    case 202:
      this.$d$ |= 2;
      break;
    case 203:
      this.$e$ |= 2;
      break;
    case 204:
      this.$h$ |= 2;
      break;
    case 205:
      this.$l$ |= 2;
      break;
    case 206:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) | 2);
      break;
    case 207:
      this.$a$ |= 2;
      break;
    case 208:
      this.$b$ |= 4;
      break;
    case 209:
      this.$c$ |= 4;
      break;
    case 210:
      this.$d$ |= 4;
      break;
    case 211:
      this.$e$ |= 4;
      break;
    case 212:
      this.$h$ |= 4;
      break;
    case 213:
      this.$l$ |= 4;
      break;
    case 214:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) | 4);
      break;
    case 215:
      this.$a$ |= 4;
      break;
    case 216:
      this.$b$ |= 8;
      break;
    case 217:
      this.$c$ |= 8;
      break;
    case 218:
      this.$d$ |= 8;
      break;
    case 219:
      this.$e$ |= 8;
      break;
    case 220:
      this.$h$ |= 8;
      break;
    case 221:
      this.$l$ |= 8;
      break;
    case 222:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) | 8);
      break;
    case 223:
      this.$a$ |= 8;
      break;
    case 224:
      this.$b$ |= 16;
      break;
    case 225:
      this.$c$ |= 16;
      break;
    case 226:
      this.$d$ |= 16;
      break;
    case 227:
      this.$e$ |= 16;
      break;
    case 228:
      this.$h$ |= 16;
      break;
    case 229:
      this.$l$ |= 16;
      break;
    case 230:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) | 16);
      break;
    case 231:
      this.$a$ |= 16;
      break;
    case 232:
      this.$b$ |= 32;
      break;
    case 233:
      this.$c$ |= 32;
      break;
    case 234:
      this.$d$ |= 32;
      break;
    case 235:
      this.$e$ |= 32;
      break;
    case 236:
      this.$h$ |= 32;
      break;
    case 237:
      this.$l$ |= 32;
      break;
    case 238:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) | 32);
      break;
    case 239:
      this.$a$ |= 32;
      break;
    case 240:
      this.$b$ |= 64;
      break;
    case 241:
      this.$c$ |= 64;
      break;
    case 242:
      this.$d$ |= 64;
      break;
    case 243:
      this.$e$ |= 64;
      break;
    case 244:
      this.$h$ |= 64;
      break;
    case 245:
      this.$l$ |= 64;
      break;
    case 246:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) | 64);
      break;
    case 247:
      this.$a$ |= 64;
      break;
    case 248:
      this.$b$ |= 128;
      break;
    case 249:
      this.$c$ |= 128;
      break;
    case 250:
      this.$d$ |= 128;
      break;
    case 251:
      this.$e$ |= 128;
      break;
    case 252:
      this.$h$ |= 128;
      break;
    case 253:
      this.$l$ |= 128;
      break;
    case 254:
      this.$writeMem$(this.$getHL$(), this.$readMem$(this.$getHL$()) | 128);
      break;
    case 255:
      this.$a$ |= 128;
      break;
    default:
      console.log('Unimplemented CB Opcode: ' + $opcode$$3$$.toString(16));
  }
}, $rlc$: function $$JSSMS$Z80$$$$$rlc$$($value$$52$$) {
  var $carry$$ = ($value$$52$$ & 128) >> 7, $value$$52$$ = ($value$$52$$ << 1 | $value$$52$$ >> 7) & 255;
  this.$f$ = $carry$$ | this.$SZP_TABLE$[$value$$52$$];
  return $value$$52$$;
}, $rrc$: function $$JSSMS$Z80$$$$$rrc$$($value$$53$$) {
  var $carry$$1$$ = $value$$53$$ & 1, $value$$53$$ = ($value$$53$$ >> 1 | $value$$53$$ << 7) & 255;
  this.$f$ = $carry$$1$$ | this.$SZP_TABLE$[$value$$53$$];
  return $value$$53$$;
}, $rl$: function $$JSSMS$Z80$$$$$rl$$($value$$54$$) {
  var $carry$$2$$ = ($value$$54$$ & 128) >> 7, $value$$54$$ = ($value$$54$$ << 1 | this.$f$ & 1) & 255;
  this.$f$ = $carry$$2$$ | this.$SZP_TABLE$[$value$$54$$];
  return $value$$54$$;
}, $rr$: function $$JSSMS$Z80$$$$$rr$$($value$$55$$) {
  var $carry$$3$$ = $value$$55$$ & 1, $value$$55$$ = ($value$$55$$ >> 1 | this.$f$ << 7) & 255;
  this.$f$ = $carry$$3$$ | this.$SZP_TABLE$[$value$$55$$];
  return $value$$55$$;
}, $sla$: function $$JSSMS$Z80$$$$$sla$$($value$$56$$) {
  var $carry$$4$$ = ($value$$56$$ & 128) >> 7, $value$$56$$ = $value$$56$$ << 1 & 255;
  this.$f$ = $carry$$4$$ | this.$SZP_TABLE$[$value$$56$$];
  return $value$$56$$;
}, $sll$: function $$JSSMS$Z80$$$$$sll$$($value$$57$$) {
  var $carry$$5$$ = ($value$$57$$ & 128) >> 7, $value$$57$$ = ($value$$57$$ << 1 | 1) & 255;
  this.$f$ = $carry$$5$$ | this.$SZP_TABLE$[$value$$57$$];
  return $value$$57$$;
}, $sra$: function $$JSSMS$Z80$$$$$sra$$($value$$58$$) {
  var $carry$$6$$ = $value$$58$$ & 1, $value$$58$$ = $value$$58$$ >> 1 | $value$$58$$ & 128;
  this.$f$ = $carry$$6$$ | this.$SZP_TABLE$[$value$$58$$];
  return $value$$58$$;
}, $srl$: function $$JSSMS$Z80$$$$$srl$$($value$$59$$) {
  var $carry$$7$$ = $value$$59$$ & 1, $value$$59$$ = $value$$59$$ >> 1 & 255;
  this.$f$ = $carry$$7$$ | this.$SZP_TABLE$[$value$$59$$];
  return $value$$59$$;
}, $bit$: function $$JSSMS$Z80$$$$$bit$$($mask$$5$$) {
  this.$f$ = this.$f$ & 1 | this.$SZ_BIT_TABLE$[$mask$$5$$];
}, $doIndexOpIX$: function $$JSSMS$Z80$$$$$doIndexOpIX$$($location$$22_opcode$$4_temp$$2$$) {
  this.$tstates$ -= $OP_DD_STATES$$[$location$$22_opcode$$4_temp$$2$$];
  switch ($location$$22_opcode$$4_temp$$2$$) {
    case 9:
      this.$setIX$(this.$add16$(this.$getIX$(), this.$getBC$()));
      break;
    case 25:
      this.$setIX$(this.$add16$(this.$getIX$(), this.$getDE$()));
      break;
    case 33:
      this.$setIX$(this.$readMemWord$(this.$pc$));
      this.$pc$ += 2;
      break;
    case 34:
      $location$$22_opcode$$4_temp$$2$$ = this.$readMemWord$(this.$pc$);
      this.$writeMem$($location$$22_opcode$$4_temp$$2$$++, this.$ixL$);
      this.$writeMem$($location$$22_opcode$$4_temp$$2$$, this.$ixH$);
      this.$pc$ += 2;
      break;
    case 35:
      this.$incIX$();
      break;
    case 36:
      this.$ixH$ = this.$inc8$(this.$ixH$);
      break;
    case 37:
      this.$ixH$ = this.$dec8$(this.$ixH$);
      break;
    case 38:
      this.$ixH$ = this.$readMem$(this.$pc$++);
      break;
    case 41:
      this.$setIX$(this.$add16$(this.$getIX$(), this.$getIX$()));
      break;
    case 42:
      $location$$22_opcode$$4_temp$$2$$ = this.$readMemWord$(this.$pc$);
      this.$ixL$ = this.$readMem$($location$$22_opcode$$4_temp$$2$$);
      this.$ixH$ = this.$readMem$(++$location$$22_opcode$$4_temp$$2$$);
      this.$pc$ += 2;
      break;
    case 43:
      this.$decIX$();
      break;
    case 44:
      this.$ixL$ = this.$inc8$(this.$ixL$);
      break;
    case 45:
      this.$ixL$ = this.$dec8$(this.$ixL$);
      break;
    case 46:
      this.$ixL$ = this.$readMem$(this.$pc$++);
      break;
    case 52:
      this.$incMem$(this.$getIX$() + this.$d_$());
      this.$pc$++;
      break;
    case 53:
      this.$decMem$(this.$getIX$() + this.$d_$());
      this.$pc$++;
      break;
    case 54:
      this.$writeMem$(this.$getIX$() + this.$d_$(), this.$readMem$(++this.$pc$));
      this.$pc$++;
      break;
    case 57:
      this.$setIX$(this.$add16$(this.$getIX$(), this.$sp$));
      break;
    case 68:
      this.$b$ = this.$ixH$;
      break;
    case 69:
      this.$b$ = this.$ixL$;
      break;
    case 70:
      this.$b$ = this.$readMem$(this.$getIX$() + this.$d_$());
      this.$pc$++;
      break;
    case 76:
      this.$c$ = this.$ixH$;
      break;
    case 77:
      this.$c$ = this.$ixL$;
      break;
    case 78:
      this.$c$ = this.$readMem$(this.$getIX$() + this.$d_$());
      this.$pc$++;
      break;
    case 84:
      this.$d$ = this.$ixH$;
      break;
    case 85:
      this.$d$ = this.$ixL$;
      break;
    case 86:
      this.$d$ = this.$readMem$(this.$getIX$() + this.$d_$());
      this.$pc$++;
      break;
    case 92:
      this.$e$ = this.$ixH$;
      break;
    case 93:
      this.$e$ = this.$ixL$;
      break;
    case 94:
      this.$e$ = this.$readMem$(this.$getIX$() + this.$d_$());
      this.$pc$++;
      break;
    case 96:
      this.$ixH$ = this.$b$;
      break;
    case 97:
      this.$ixH$ = this.$c$;
      break;
    case 98:
      this.$ixH$ = this.$d$;
      break;
    case 99:
      this.$ixH$ = this.$e$;
      break;
    case 100:
      break;
    case 101:
      this.$ixH$ = this.$ixL$;
      break;
    case 102:
      this.$h$ = this.$readMem$(this.$getIX$() + this.$d_$());
      this.$pc$++;
      break;
    case 103:
      this.$ixH$ = this.$a$;
      break;
    case 104:
      this.$ixL$ = this.$b$;
      break;
    case 105:
      this.$ixL$ = this.$c$;
      break;
    case 106:
      this.$ixL$ = this.$d$;
      break;
    case 107:
      this.$ixL$ = this.$e$;
      break;
    case 108:
      this.$ixL$ = this.$ixH$;
      break;
    case 109:
      break;
    case 110:
      this.$l$ = this.$readMem$(this.$getIX$() + this.$d_$());
      this.$pc$++;
      break;
    case 111:
      this.$ixL$ = this.$a$;
      break;
    case 112:
      this.$writeMem$(this.$getIX$() + this.$d_$(), this.$b$);
      this.$pc$++;
      break;
    case 113:
      this.$writeMem$(this.$getIX$() + this.$d_$(), this.$c$);
      this.$pc$++;
      break;
    case 114:
      this.$writeMem$(this.$getIX$() + this.$d_$(), this.$d$);
      this.$pc$++;
      break;
    case 115:
      this.$writeMem$(this.$getIX$() + this.$d_$(), this.$e$);
      this.$pc$++;
      break;
    case 116:
      this.$writeMem$(this.$getIX$() + this.$d_$(), this.$h$);
      this.$pc$++;
      break;
    case 117:
      this.$writeMem$(this.$getIX$() + this.$d_$(), this.$l$);
      this.$pc$++;
      break;
    case 119:
      this.$writeMem$(this.$getIX$() + this.$d_$(), this.$a$);
      this.$pc$++;
      break;
    case 124:
      this.$a$ = this.$ixH$;
      break;
    case 125:
      this.$a$ = this.$ixL$;
      break;
    case 126:
      this.$a$ = this.$readMem$(this.$getIX$() + this.$d_$());
      this.$pc$++;
      break;
    case 132:
      this.$add_a$(this.$ixH$);
      break;
    case 133:
      this.$add_a$(this.$ixL$);
      break;
    case 134:
      this.$add_a$(this.$readMem$(this.$getIX$() + this.$d_$()));
      this.$pc$++;
      break;
    case 140:
      this.$adc_a$(this.$ixH$);
      break;
    case 141:
      this.$adc_a$(this.$ixL$);
      break;
    case 142:
      this.$adc_a$(this.$readMem$(this.$getIX$() + this.$d_$()));
      this.$pc$++;
      break;
    case 148:
      this.$sub_a$(this.$ixH$);
      break;
    case 149:
      this.$sub_a$(this.$ixL$);
      break;
    case 150:
      this.$sub_a$(this.$readMem$(this.$getIX$() + this.$d_$()));
      this.$pc$++;
      break;
    case 156:
      this.$sbc_a$(this.$ixH$);
      break;
    case 157:
      this.$sbc_a$(this.$ixL$);
      break;
    case 158:
      this.$sbc_a$(this.$readMem$(this.$getIX$() + this.$d_$()));
      this.$pc$++;
      break;
    case 164:
      this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$ixH$] | 16;
      break;
    case 165:
      this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$ixL$] | 16;
      break;
    case 166:
      this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$readMem$(this.$getIX$() + this.$d_$())] | 16;
      this.$pc$++;
      break;
    case 172:
      this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$ixH$];
      break;
    case 173:
      this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$ixL$];
      break;
    case 174:
      this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$readMem$(this.$getIX$() + this.$d_$())];
      this.$pc$++;
      break;
    case 180:
      this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$ixH$];
      break;
    case 181:
      this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$ixL$];
      break;
    case 182:
      this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$readMem$(this.$getIX$() + this.$d_$())];
      this.$pc$++;
      break;
    case 188:
      this.$cp_a$(this.$ixH$);
      break;
    case 189:
      this.$cp_a$(this.$ixL$);
      break;
    case 190:
      this.$cp_a$(this.$readMem$(this.$getIX$() + this.$d_$()));
      this.$pc$++;
      break;
    case 203:
      this.$doIndexCB$(this.$getIX$());
      break;
    case 225:
      this.$setIX$(this.$readMemWord$(this.$sp$));
      this.$sp$ += 2;
      break;
    case 227:
      $location$$22_opcode$$4_temp$$2$$ = this.$getIX$();
      this.$setIX$(this.$readMemWord$(this.$sp$));
      this.$writeMem$(this.$sp$, $location$$22_opcode$$4_temp$$2$$ & 255);
      this.$writeMem$(this.$sp$ + 1, $location$$22_opcode$$4_temp$$2$$ >> 8);
      break;
    case 229:
      this.push(this.$ixH$, this.$ixL$);
      break;
    case 233:
      this.$pc$ = this.$getIX$();
      break;
    case 249:
      this.$sp$ = this.$getIX$();
      break;
    default:
      this.$pc$--;
  }
}, $doIndexOpIY$: function $$JSSMS$Z80$$$$$doIndexOpIY$$($location$$23_opcode$$5_temp$$3$$) {
  this.$tstates$ -= $OP_DD_STATES$$[$location$$23_opcode$$5_temp$$3$$];
  switch ($location$$23_opcode$$5_temp$$3$$) {
    case 9:
      this.$setIY$(this.$add16$(this.$getIY$(), this.$getBC$()));
      break;
    case 25:
      this.$setIY$(this.$add16$(this.$getIY$(), this.$getDE$()));
      break;
    case 33:
      this.$setIY$(this.$readMemWord$(this.$pc$));
      this.$pc$ += 2;
      break;
    case 34:
      $location$$23_opcode$$5_temp$$3$$ = this.$readMemWord$(this.$pc$);
      this.$writeMem$($location$$23_opcode$$5_temp$$3$$++, this.$iyL$);
      this.$writeMem$($location$$23_opcode$$5_temp$$3$$, this.$iyH$);
      this.$pc$ += 2;
      break;
    case 35:
      this.$incIY$();
      break;
    case 36:
      this.$iyH$ = this.$inc8$(this.$iyH$);
      break;
    case 37:
      this.$iyH$ = this.$dec8$(this.$iyH$);
      break;
    case 38:
      this.$iyH$ = this.$readMem$(this.$pc$++);
      break;
    case 41:
      this.$setIY$(this.$add16$(this.$getIY$(), this.$getIY$()));
      break;
    case 42:
      $location$$23_opcode$$5_temp$$3$$ = this.$readMemWord$(this.$pc$);
      this.$iyL$ = this.$readMem$($location$$23_opcode$$5_temp$$3$$);
      this.$iyH$ = this.$readMem$(++$location$$23_opcode$$5_temp$$3$$);
      this.$pc$ += 2;
      break;
    case 43:
      this.$decIY$();
      break;
    case 44:
      this.$iyL$ = this.$inc8$(this.$iyL$);
      break;
    case 45:
      this.$iyL$ = this.$dec8$(this.$iyL$);
      break;
    case 46:
      this.$iyL$ = this.$readMem$(this.$pc$++);
      break;
    case 52:
      this.$incMem$(this.$getIY$() + this.$d_$());
      this.$pc$++;
      break;
    case 53:
      this.$decMem$(this.$getIY$() + this.$d_$());
      this.$pc$++;
      break;
    case 54:
      this.$writeMem$(this.$getIY$() + this.$d_$(), this.$readMem$(++this.$pc$));
      this.$pc$++;
      break;
    case 57:
      this.$setIY$(this.$add16$(this.$getIY$(), this.$sp$));
      break;
    case 68:
      this.$b$ = this.$iyH$;
      break;
    case 69:
      this.$b$ = this.$iyL$;
      break;
    case 70:
      this.$b$ = this.$readMem$(this.$getIY$() + this.$d_$());
      this.$pc$++;
      break;
    case 76:
      this.$c$ = this.$iyH$;
      break;
    case 77:
      this.$c$ = this.$iyL$;
      break;
    case 78:
      this.$c$ = this.$readMem$(this.$getIY$() + this.$d_$());
      this.$pc$++;
      break;
    case 84:
      this.$d$ = this.$iyH$;
      break;
    case 85:
      this.$d$ = this.$iyL$;
      break;
    case 86:
      this.$d$ = this.$readMem$(this.$getIY$() + this.$d_$());
      this.$pc$++;
      break;
    case 92:
      this.$e$ = this.$iyH$;
      break;
    case 93:
      this.$e$ = this.$iyL$;
      break;
    case 94:
      this.$e$ = this.$readMem$(this.$getIY$() + this.$d_$());
      this.$pc$++;
      break;
    case 96:
      this.$iyH$ = this.$b$;
      break;
    case 97:
      this.$iyH$ = this.$c$;
      break;
    case 98:
      this.$iyH$ = this.$d$;
      break;
    case 99:
      this.$iyH$ = this.$e$;
      break;
    case 100:
      break;
    case 101:
      this.$iyH$ = this.$iyL$;
      break;
    case 102:
      this.$h$ = this.$readMem$(this.$getIY$() + this.$d_$());
      this.$pc$++;
      break;
    case 103:
      this.$iyH$ = this.$a$;
      break;
    case 104:
      this.$iyL$ = this.$b$;
      break;
    case 105:
      this.$iyL$ = this.$c$;
      break;
    case 106:
      this.$iyL$ = this.$d$;
      break;
    case 107:
      this.$iyL$ = this.$e$;
      break;
    case 108:
      this.$iyL$ = this.$iyH$;
      break;
    case 109:
      break;
    case 110:
      this.$l$ = this.$readMem$(this.$getIY$() + this.$d_$());
      this.$pc$++;
      break;
    case 111:
      this.$iyL$ = this.$a$;
      break;
    case 112:
      this.$writeMem$(this.$getIY$() + this.$d_$(), this.$b$);
      this.$pc$++;
      break;
    case 113:
      this.$writeMem$(this.$getIY$() + this.$d_$(), this.$c$);
      this.$pc$++;
      break;
    case 114:
      this.$writeMem$(this.$getIY$() + this.$d_$(), this.$d$);
      this.$pc$++;
      break;
    case 115:
      this.$writeMem$(this.$getIY$() + this.$d_$(), this.$e$);
      this.$pc$++;
      break;
    case 116:
      this.$writeMem$(this.$getIY$() + this.$d_$(), this.$h$);
      this.$pc$++;
      break;
    case 117:
      this.$writeMem$(this.$getIY$() + this.$d_$(), this.$l$);
      this.$pc$++;
      break;
    case 119:
      this.$writeMem$(this.$getIY$() + this.$d_$(), this.$a$);
      this.$pc$++;
      break;
    case 124:
      this.$a$ = this.$iyH$;
      break;
    case 125:
      this.$a$ = this.$iyL$;
      break;
    case 126:
      this.$a$ = this.$readMem$(this.$getIY$() + this.$d_$());
      this.$pc$++;
      break;
    case 132:
      this.$add_a$(this.$iyH$);
      break;
    case 133:
      this.$add_a$(this.$iyL$);
      break;
    case 134:
      this.$add_a$(this.$readMem$(this.$getIY$() + this.$d_$()));
      this.$pc$++;
      break;
    case 140:
      this.$adc_a$(this.$iyH$);
      break;
    case 141:
      this.$adc_a$(this.$iyL$);
      break;
    case 142:
      this.$adc_a$(this.$readMem$(this.$getIY$() + this.$d_$()));
      this.$pc$++;
      break;
    case 148:
      this.$sub_a$(this.$iyH$);
      break;
    case 149:
      this.$sub_a$(this.$iyL$);
      break;
    case 150:
      this.$sub_a$(this.$readMem$(this.$getIY$() + this.$d_$()));
      this.$pc$++;
      break;
    case 156:
      this.$sbc_a$(this.$iyH$);
      break;
    case 157:
      this.$sbc_a$(this.$iyL$);
      break;
    case 158:
      this.$sbc_a$(this.$readMem$(this.$getIY$() + this.$d_$()));
      this.$pc$++;
      break;
    case 164:
      this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$iyH$] | 16;
      break;
    case 165:
      this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$iyL$] | 16;
      break;
    case 166:
      this.$f$ = this.$SZP_TABLE$[this.$a$ &= this.$readMem$(this.$getIY$() + this.$d_$())] | 16;
      this.$pc$++;
      break;
    case 172:
      this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$iyH$];
      break;
    case 173:
      this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$iyL$];
      break;
    case 174:
      this.$f$ = this.$SZP_TABLE$[this.$a$ ^= this.$readMem$(this.$getIY$() + this.$d_$())];
      this.$pc$++;
      break;
    case 180:
      this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$iyH$];
      break;
    case 181:
      this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$iyL$];
      break;
    case 182:
      this.$f$ = this.$SZP_TABLE$[this.$a$ |= this.$readMem$(this.$getIY$() + this.$d_$())];
      this.$pc$++;
      break;
    case 188:
      this.$cp_a$(this.$iyH$);
      break;
    case 189:
      this.$cp_a$(this.$iyL$);
      break;
    case 190:
      this.$cp_a$(this.$readMem$(this.$getIY$() + this.$d_$()));
      this.$pc$++;
      break;
    case 203:
      this.$doIndexCB$(this.$getIY$());
      break;
    case 225:
      this.$setIY$(this.$readMemWord$(this.$sp$));
      this.$sp$ += 2;
      break;
    case 227:
      $location$$23_opcode$$5_temp$$3$$ = this.$getIY$();
      this.$setIY$(this.$readMemWord$(this.$sp$));
      this.$writeMem$(this.$sp$, $location$$23_opcode$$5_temp$$3$$ & 255);
      this.$writeMem$(this.$sp$ + 1, $location$$23_opcode$$5_temp$$3$$ >> 8);
      break;
    case 229:
      this.push(this.$iyH$, this.$iyL$);
      break;
    case 233:
      this.$pc$ = this.$getIY$();
      break;
    case 249:
      this.$sp$ = this.$getIY$();
      break;
    default:
      this.$pc$--;
  }
}, $doIndexCB$: function $$JSSMS$Z80$$$$$doIndexCB$$($index$$44_location$$24$$) {
  var $index$$44_location$$24$$ = $index$$44_location$$24$$ + this.$d_$() & 65535, $opcode$$6$$ = this.$readMem$(++this.$pc$);
  this.$tstates$ -= $OP_INDEX_CB_STATES$$[$opcode$$6$$];
  switch ($opcode$$6$$) {
    case 6:
      this.$writeMem$($index$$44_location$$24$$, this.$rlc$(this.$readMem$($index$$44_location$$24$$)));
      break;
    case 14:
      this.$writeMem$($index$$44_location$$24$$, this.$rrc$(this.$readMem$($index$$44_location$$24$$)));
      break;
    case 22:
      this.$writeMem$($index$$44_location$$24$$, this.$rl$(this.$readMem$($index$$44_location$$24$$)));
      break;
    case 30:
      this.$writeMem$($index$$44_location$$24$$, this.$rr$(this.$readMem$($index$$44_location$$24$$)));
      break;
    case 38:
      this.$writeMem$($index$$44_location$$24$$, this.$sla$(this.$readMem$($index$$44_location$$24$$)));
      break;
    case 46:
      this.$writeMem$($index$$44_location$$24$$, this.$sra$(this.$readMem$($index$$44_location$$24$$)));
      break;
    case 54:
      this.$writeMem$($index$$44_location$$24$$, this.$sll$(this.$readMem$($index$$44_location$$24$$)));
      break;
    case 62:
      this.$writeMem$($index$$44_location$$24$$, this.$srl$(this.$readMem$($index$$44_location$$24$$)));
      break;
    case 70:
      this.$bit$(this.$readMem$($index$$44_location$$24$$) & 1);
      break;
    case 78:
      this.$bit$(this.$readMem$($index$$44_location$$24$$) & 2);
      break;
    case 86:
      this.$bit$(this.$readMem$($index$$44_location$$24$$) & 4);
      break;
    case 94:
      this.$bit$(this.$readMem$($index$$44_location$$24$$) & 8);
      break;
    case 102:
      this.$bit$(this.$readMem$($index$$44_location$$24$$) & 16);
      break;
    case 110:
      this.$bit$(this.$readMem$($index$$44_location$$24$$) & 32);
      break;
    case 118:
      this.$bit$(this.$readMem$($index$$44_location$$24$$) & 64);
      break;
    case 126:
      this.$bit$(this.$readMem$($index$$44_location$$24$$) & 128);
      break;
    case 134:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) & -2);
      break;
    case 142:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) & -3);
      break;
    case 150:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) & -5);
      break;
    case 158:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) & -9);
      break;
    case 166:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) & -17);
      break;
    case 174:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) & -33);
      break;
    case 182:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) & -65);
      break;
    case 190:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) & -129);
      break;
    case 198:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) | 1);
      break;
    case 206:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) | 2);
      break;
    case 214:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) | 4);
      break;
    case 222:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) | 8);
      break;
    case 230:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) | 16);
      break;
    case 238:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) | 32);
      break;
    case 246:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) | 64);
      break;
    case 254:
      this.$writeMem$($index$$44_location$$24$$, this.$readMem$($index$$44_location$$24$$) | 128);
      break;
    default:
      console.log('Unimplemented DDCB or FDCB Opcode: ' + ($opcode$$6$$ & 255).toString(16));
  }
  this.$pc$++;
}, $doED$: function $$JSSMS$Z80$$$$$doED$$($a_copy_location$$25_opcode$$7_temp$$4$$) {
  this.$tstates$ -= $OP_ED_STATES$$[$a_copy_location$$25_opcode$$7_temp$$4$$];
  switch ($a_copy_location$$25_opcode$$7_temp$$4$$) {
    case 64:
      this.$b$ = this.port.$in_$(this.$c$);
      this.$f$ = this.$f$ & 1 | this.$SZP_TABLE$[this.$b$];
      this.$pc$++;
      break;
    case 65:
      this.port.$out$(this.$c$, this.$b$);
      this.$pc$++;
      break;
    case 66:
      this.$sbc16$(this.$getBC$());
      this.$pc$++;
      break;
    case 67:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$readMemWord$(this.$pc$ + 1);
      this.$writeMem$($a_copy_location$$25_opcode$$7_temp$$4$$++, this.$c$);
      this.$writeMem$($a_copy_location$$25_opcode$$7_temp$$4$$, this.$b$);
      this.$pc$ += 3;
      break;
    case 68:
;
    case 76:
;
    case 84:
;
    case 92:
;
    case 100:
;
    case 108:
;
    case 116:
;
    case 124:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$a$;
      this.$a$ = 0;
      this.$sub_a$($a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$pc$++;
      break;
    case 69:
;
    case 77:
;
    case 85:
;
    case 93:
;
    case 101:
;
    case 109:
;
    case 117:
;
    case 125:
      this.$pc$ = this.$readMemWord$(this.$sp$);
      this.$sp$ += 2;
      this.$iff1$ = this.$iff2$;
      break;
    case 70:
;
    case 78:
;
    case 102:
;
    case 110:
      this.$im$ = 0;
      this.$pc$++;
      break;
    case 71:
      this.$i$ = this.$a$;
      this.$pc$++;
      break;
    case 72:
      this.$c$ = this.port.$in_$(this.$c$);
      this.$f$ = this.$f$ & 1 | this.$SZP_TABLE$[this.$c$];
      this.$pc$++;
      break;
    case 73:
      this.port.$out$(this.$c$, this.$c$);
      this.$pc$++;
      break;
    case 74:
      this.$adc16$(this.$getBC$());
      this.$pc$++;
      break;
    case 75:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$readMemWord$(this.$pc$ + 1);
      this.$c$ = this.$readMem$($a_copy_location$$25_opcode$$7_temp$$4$$++);
      this.$b$ = this.$readMem$($a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$pc$ += 3;
      break;
    case 79:
      this.$pc$++;
      break;
    case 80:
      this.$d$ = this.port.$in_$(this.$c$);
      this.$f$ = this.$f$ & 1 | this.$SZP_TABLE$[this.$d$];
      this.$pc$++;
      break;
    case 81:
      this.port.$out$(this.$c$, this.$d$);
      this.$pc$++;
      break;
    case 82:
      this.$sbc16$(this.$getDE$());
      this.$pc$++;
      break;
    case 83:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$readMemWord$(this.$pc$ + 1);
      this.$writeMem$($a_copy_location$$25_opcode$$7_temp$$4$$++, this.$e$);
      this.$writeMem$($a_copy_location$$25_opcode$$7_temp$$4$$, this.$d$);
      this.$pc$ += 3;
      break;
    case 86:
;
    case 118:
      this.$im$ = 1;
      this.$pc$++;
      break;
    case 87:
      this.$a$ = this.$i$;
      this.$f$ = this.$f$ & 1 | this.$SZ_TABLE$[this.$a$] | (this.$iff2$ ? 4 : 0);
      this.$pc$++;
      break;
    case 88:
      this.$e$ = this.port.$in_$(this.$c$);
      this.$f$ = this.$f$ & 1 | this.$SZP_TABLE$[this.$e$];
      this.$pc$++;
      break;
    case 89:
      this.port.$out$(this.$c$, this.$e$);
      this.$pc$++;
      break;
    case 90:
      this.$adc16$(this.$getDE$());
      this.$pc$++;
      break;
    case 91:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$readMemWord$(this.$pc$ + 1);
      this.$e$ = this.$readMem$($a_copy_location$$25_opcode$$7_temp$$4$$++);
      this.$d$ = this.$readMem$($a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$pc$ += 3;
      break;
    case 95:
      this.$a$ = Math.round(255 * Math.random());
      this.$f$ = this.$f$ & 1 | this.$SZ_TABLE$[this.$a$] | (this.$iff2$ ? 4 : 0);
      this.$pc$++;
      break;
    case 96:
      this.$h$ = this.port.$in_$(this.$c$);
      this.$f$ = this.$f$ & 1 | this.$SZP_TABLE$[this.$h$];
      this.$pc$++;
      break;
    case 97:
      this.port.$out$(this.$c$, this.$h$);
      this.$pc$++;
      break;
    case 98:
      this.$sbc16$(this.$getHL$());
      this.$pc$++;
      break;
    case 99:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$readMemWord$(this.$pc$ + 1);
      this.$writeMem$($a_copy_location$$25_opcode$$7_temp$$4$$++, this.$l$);
      this.$writeMem$($a_copy_location$$25_opcode$$7_temp$$4$$, this.$h$);
      this.$pc$ += 3;
      break;
    case 103:
      var $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$getHL$(), $hlmem$$ = this.$readMem$($a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$writeMem$($a_copy_location$$25_opcode$$7_temp$$4$$, $hlmem$$ >> 4 | (this.$a$ & 15) << 4);
      this.$a$ = this.$a$ & 240 | $hlmem$$ & 15;
      this.$f$ = this.$f$ & 1 | this.$SZP_TABLE$[this.$a$];
      this.$pc$++;
      break;
    case 104:
      this.$l$ = this.port.$in_$(this.$c$);
      this.$f$ = this.$f$ & 1 | this.$SZP_TABLE$[this.$l$];
      this.$pc$++;
      break;
    case 105:
      this.port.$out$(this.$c$, this.$l$);
      this.$pc$++;
      break;
    case 106:
      this.$adc16$(this.$getHL$());
      this.$pc$++;
      break;
    case 107:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$readMemWord$(this.$pc$ + 1);
      this.$l$ = this.$readMem$($a_copy_location$$25_opcode$$7_temp$$4$$++);
      this.$h$ = this.$readMem$($a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$pc$ += 3;
      break;
    case 111:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$getHL$();
      $hlmem$$ = this.$readMem$($a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$writeMem$($a_copy_location$$25_opcode$$7_temp$$4$$, ($hlmem$$ & 15) << 4 | this.$a$ & 15);
      this.$a$ = this.$a$ & 240 | $hlmem$$ >> 4;
      this.$f$ = this.$f$ & 1 | this.$SZP_TABLE$[this.$a$];
      this.$pc$++;
      break;
    case 113:
      this.port.$out$(this.$c$, 0);
      this.$pc$++;
      break;
    case 114:
      this.$sbc16$(this.$sp$);
      this.$pc$++;
      break;
    case 115:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$readMemWord$(this.$pc$ + 1);
      this.$writeMem$($a_copy_location$$25_opcode$$7_temp$$4$$++, this.$sp$ & 255);
      this.$writeMem$($a_copy_location$$25_opcode$$7_temp$$4$$, this.$sp$ >> 8);
      this.$pc$ += 3;
      break;
    case 120:
      this.$a$ = this.port.$in_$(this.$c$);
      this.$f$ = this.$f$ & 1 | this.$SZP_TABLE$[this.$a$];
      this.$pc$++;
      break;
    case 121:
      this.port.$out$(this.$c$, this.$a$);
      this.$pc$++;
      break;
    case 122:
      this.$adc16$(this.$sp$);
      this.$pc$++;
      break;
    case 123:
      this.$sp$ = this.$readMemWord$(this.$readMemWord$(this.$pc$ + 1));
      this.$pc$ += 3;
      break;
    case 160:
      this.$writeMem$(this.$getDE$(), this.$readMem$(this.$getHL$()));
      this.$incDE$();
      this.$incHL$();
      this.$decBC$();
      this.$f$ = this.$f$ & 193 | (0 != this.$getBC$() ? 4 : 0);
      this.$pc$++;
      break;
    case 161:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$f$ & 1 | 2;
      this.$cp_a$(this.$readMem$(this.$getHL$()));
      this.$incHL$();
      this.$decBC$();
      $a_copy_location$$25_opcode$$7_temp$$4$$ |= 0 == this.$getBC$() ? 0 : 4;
      this.$f$ = this.$f$ & 248 | $a_copy_location$$25_opcode$$7_temp$$4$$;
      this.$pc$++;
      break;
    case 162:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.port.$in_$(this.$c$);
      this.$writeMem$(this.$getHL$(), $a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$b$ = this.$dec8$(this.$b$);
      this.$incHL$();
      this.$f$ = 128 == ($a_copy_location$$25_opcode$$7_temp$$4$$ & 128) ? this.$f$ | 2 : this.$f$ & -3;
      this.$pc$++;
      break;
    case 163:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$readMem$(this.$getHL$());
      this.port.$out$(this.$c$, $a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$incHL$();
      this.$b$ = this.$dec8$(this.$b$);
      255 < this.$l$ + $a_copy_location$$25_opcode$$7_temp$$4$$ ? (this.$f$ |= 1, this.$f$ |= 16) : (this.$f$ &= -2, this.$f$ &= -17);
      this.$f$ = 128 == ($a_copy_location$$25_opcode$$7_temp$$4$$ & 128) ? this.$f$ | 2 : this.$f$ & -3;
      this.$pc$++;
      break;
    case 168:
      this.$writeMem$(this.$getDE$(), this.$readMem$(this.$getHL$()));
      this.$decDE$();
      this.$decHL$();
      this.$decBC$();
      this.$f$ = this.$f$ & 193 | (0 != this.$getBC$() ? 4 : 0);
      this.$pc$++;
      break;
    case 169:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$f$ & 1 | 2;
      this.$cp_a$(this.$readMem$(this.$getHL$()));
      this.$decHL$();
      this.$decBC$();
      $a_copy_location$$25_opcode$$7_temp$$4$$ |= 0 == this.$getBC$() ? 0 : 4;
      this.$f$ = this.$f$ & 248 | $a_copy_location$$25_opcode$$7_temp$$4$$;
      this.$pc$++;
      break;
    case 170:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.port.$in_$(this.$c$);
      this.$writeMem$(this.$getHL$(), $a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$b$ = this.$dec8$(this.$b$);
      this.$decHL$();
      this.$f$ = 0 != ($a_copy_location$$25_opcode$$7_temp$$4$$ & 128) ? this.$f$ | 2 : this.$f$ & -3;
      this.$pc$++;
      break;
    case 171:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$readMem$(this.$getHL$());
      this.port.$out$(this.$c$, $a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$decHL$();
      this.$b$ = this.$dec8$(this.$b$);
      255 < this.$l$ + $a_copy_location$$25_opcode$$7_temp$$4$$ ? (this.$f$ |= 1, this.$f$ |= 16) : (this.$f$ &= -2, this.$f$ &= -17);
      this.$f$ = 128 == ($a_copy_location$$25_opcode$$7_temp$$4$$ & 128) ? this.$f$ | 2 : this.$f$ & -3;
      this.$pc$++;
      break;
    case 176:
      this.$writeMem$(this.$getDE$(), this.$readMem$(this.$getHL$()));
      this.$incDE$();
      this.$incHL$();
      this.$decBC$();
      0 != this.$getBC$() ? (this.$f$ |= 4, this.$tstates$ -= 5, this.$pc$--) : (this.$f$ &= -5, this.$pc$++);
      this.$f$ &= -3;
      this.$f$ &= -17;
      break;
    case 177:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$f$ & 1 | 2;
      this.$cp_a$(this.$readMem$(this.$getHL$()));
      this.$incHL$();
      this.$decBC$();
      $a_copy_location$$25_opcode$$7_temp$$4$$ |= 0 == this.$getBC$() ? 0 : 4;
      0 != ($a_copy_location$$25_opcode$$7_temp$$4$$ & 4) && 0 == (this.$f$ & 64) ? (this.$tstates$ -= 5, this.$pc$--) : this.$pc$++;
      this.$f$ = this.$f$ & 248 | $a_copy_location$$25_opcode$$7_temp$$4$$;
      break;
    case 178:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.port.$in_$(this.$c$);
      this.$writeMem$(this.$getHL$(), $a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$b$ = this.$dec8$(this.$b$);
      this.$incHL$();
      0 != this.$b$ ? (this.$tstates$ -= 5, this.$pc$--) : this.$pc$++;
      this.$f$ = 128 == ($a_copy_location$$25_opcode$$7_temp$$4$$ & 128) ? this.$f$ | 2 : this.$f$ & -3;
      break;
    case 179:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$readMem$(this.$getHL$());
      this.port.$out$(this.$c$, $a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$b$ = this.$dec8$(this.$b$);
      this.$incHL$();
      0 != this.$b$ ? (this.$tstates$ -= 5, this.$pc$--) : this.$pc$++;
      255 < this.$l$ + $a_copy_location$$25_opcode$$7_temp$$4$$ ? (this.$f$ |= 1, this.$f$ |= 16) : (this.$f$ &= -2, this.$f$ &= -17);
      this.$f$ = 0 != ($a_copy_location$$25_opcode$$7_temp$$4$$ & 128) ? this.$f$ | 2 : this.$f$ & -3;
      break;
    case 184:
      this.$writeMem$(this.$getDE$(), this.$readMem$(this.$getHL$()));
      this.$decDE$();
      this.$decHL$();
      this.$decBC$();
      0 != this.$getBC$() ? (this.$f$ |= 4, this.$tstates$ -= 5, this.$pc$--) : (this.$f$ &= -5, this.$pc$++);
      this.$f$ &= -3;
      this.$f$ &= -17;
      break;
    case 185:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$f$ & 1 | 2;
      this.$cp_a$(this.$readMem$(this.$getHL$()));
      this.$decHL$();
      this.$decBC$();
      $a_copy_location$$25_opcode$$7_temp$$4$$ |= 0 == this.$getBC$() ? 0 : 4;
      0 != ($a_copy_location$$25_opcode$$7_temp$$4$$ & 4) && 0 == (this.$f$ & 64) ? (this.$tstates$ -= 5, this.$pc$--) : this.$pc$++;
      this.$f$ = this.$f$ & 248 | $a_copy_location$$25_opcode$$7_temp$$4$$;
      break;
    case 186:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.port.$in_$(this.$c$);
      this.$writeMem$(this.$getHL$(), $a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$b$ = this.$dec8$(this.$b$);
      this.$decHL$();
      0 != this.$b$ ? (this.$tstates$ -= 5, this.$pc$--) : this.$pc$++;
      this.$f$ = 0 != ($a_copy_location$$25_opcode$$7_temp$$4$$ & 128) ? this.$f$ | 2 : this.$f$ & -3;
      break;
    case 187:
      $a_copy_location$$25_opcode$$7_temp$$4$$ = this.$readMem$(this.$getHL$());
      this.port.$out$(this.$c$, $a_copy_location$$25_opcode$$7_temp$$4$$);
      this.$b$ = this.$dec8$(this.$b$);
      this.$decHL$();
      0 != this.$b$ ? (this.$tstates$ -= 5, this.$pc$--) : this.$pc$++;
      255 < this.$l$ + $a_copy_location$$25_opcode$$7_temp$$4$$ ? (this.$f$ |= 1, this.$f$ |= 16) : (this.$f$ &= -2, this.$f$ &= -17);
      this.$f$ = 0 != ($a_copy_location$$25_opcode$$7_temp$$4$$ & 128) ? this.$f$ | 2 : this.$f$ & -3;
      break;
    default:
      console.log('Unimplemented ED Opcode: ' + $a_copy_location$$25_opcode$$7_temp$$4$$.toString(16)), this.$pc$++;
  }
}, $generateDAATable$: function $$JSSMS$Z80$$$$$generateDAATable$$() {
  this.$DAA_TABLE$ = Array(2048);
  for (var $i$$5$$ = 256; 0 != $i$$5$$--;) {
    for (var $c$$ = 0; 1 >= $c$$; $c$$++) {
      for (var $h$$4$$ = 0; 1 >= $h$$4$$; $h$$4$$++) {
        for (var $n$$1$$ = 0; 1 >= $n$$1$$; $n$$1$$++) {
          this.$DAA_TABLE$[$c$$ << 8 | $n$$1$$ << 9 | $h$$4$$ << 10 | $i$$5$$] = this.$getDAAResult$($i$$5$$, $c$$ | $n$$1$$ << 1 | $h$$4$$ << 4);
        }
      }
    }
  }
  this.$a$ = this.$f$ = 0;
}, $getDAAResult$: function $$JSSMS$Z80$$$$$getDAAResult$$($value$$60$$, $flags$$2$$) {
  this.$a$ = $value$$60$$;
  this.$f$ = $flags$$2$$;
  var $a_copy$$1$$ = this.$a$, $correction$$ = 0, $carry$$8$$ = $flags$$2$$ & 1, $carry_copy$$ = $carry$$8$$;
  if (0 != ($flags$$2$$ & 16) || 9 < ($a_copy$$1$$ & 15)) {
    $correction$$ |= 6;
  }
  if (1 == $carry$$8$$ || 159 < $a_copy$$1$$ || 143 < $a_copy$$1$$ && 9 < ($a_copy$$1$$ & 15)) {
    $correction$$ |= 96, $carry_copy$$ = 1;
  }
  153 < $a_copy$$1$$ && ($carry_copy$$ = 1);
  0 != ($flags$$2$$ & 2) ? this.$sub_a$($correction$$) : this.$add_a$($correction$$);
  $flags$$2$$ = this.$f$ & 254 | $carry_copy$$;
  $flags$$2$$ = this.$getParity$(this.$a$) ? $flags$$2$$ & 251 | 4 : $flags$$2$$ & 251;
  return this.$a$ | $flags$$2$$ << 8;
}, $add_a$: function $$JSSMS$Z80$$$$$add_a$$($temp$$5_value$$61$$) {
  $temp$$5_value$$61$$ = this.$a$ + $temp$$5_value$$61$$ & 255;
  this.$f$ = this.$SZHVC_ADD_TABLE$[this.$a$ << 8 | $temp$$5_value$$61$$];
  this.$a$ = $temp$$5_value$$61$$;
}, $adc_a$: function $$JSSMS$Z80$$$$$adc_a$$($temp$$6_value$$62$$) {
  var $carry$$9$$ = this.$f$ & 1, $temp$$6_value$$62$$ = this.$a$ + $temp$$6_value$$62$$ + $carry$$9$$ & 255;
  this.$f$ = this.$SZHVC_ADD_TABLE$[$carry$$9$$ << 16 | this.$a$ << 8 | $temp$$6_value$$62$$];
  this.$a$ = $temp$$6_value$$62$$;
}, $sub_a$: function $$JSSMS$Z80$$$$$sub_a$$($temp$$7_value$$63$$) {
  $temp$$7_value$$63$$ = this.$a$ - $temp$$7_value$$63$$ & 255;
  this.$f$ = this.$SZHVC_SUB_TABLE$[this.$a$ << 8 | $temp$$7_value$$63$$];
  this.$a$ = $temp$$7_value$$63$$;
}, $sbc_a$: function $$JSSMS$Z80$$$$$sbc_a$$($temp$$8_value$$64$$) {
  var $carry$$10$$ = this.$f$ & 1, $temp$$8_value$$64$$ = this.$a$ - $temp$$8_value$$64$$ - $carry$$10$$ & 255;
  this.$f$ = this.$SZHVC_SUB_TABLE$[$carry$$10$$ << 16 | this.$a$ << 8 | $temp$$8_value$$64$$];
  this.$a$ = $temp$$8_value$$64$$;
}, $cp_a$: function $$JSSMS$Z80$$$$$cp_a$$($value$$65$$) {
  this.$f$ = this.$SZHVC_SUB_TABLE$[this.$a$ << 8 | this.$a$ - $value$$65$$ & 255];
}, $cpl_a$: function $$JSSMS$Z80$$$$$cpl_a$$() {
  this.$a$ ^= 255;
  this.$f$ |= 18;
}, $rra_a$: function $$JSSMS$Z80$$$$$rra_a$$() {
  var $carry$$11$$ = this.$a$ & 1;
  this.$a$ = (this.$a$ >> 1 | (this.$f$ & 1) << 7) & 255;
  this.$f$ = this.$f$ & 236 | $carry$$11$$;
}, $rla_a$: function $$JSSMS$Z80$$$$$rla_a$$() {
  var $carry$$12$$ = this.$a$ >> 7;
  this.$a$ = (this.$a$ << 1 | this.$f$ & 1) & 255;
  this.$f$ = this.$f$ & 236 | $carry$$12$$;
}, $rlca_a$: function $$JSSMS$Z80$$$$$rlca_a$$() {
  var $carry$$13$$ = this.$a$ >> 7;
  this.$a$ = this.$a$ << 1 & 255 | $carry$$13$$;
  this.$f$ = this.$f$ & 236 | $carry$$13$$;
}, $rrca_a$: function $$JSSMS$Z80$$$$$rrca_a$$() {
  var $carry$$14$$ = this.$a$ & 1;
  this.$a$ = this.$a$ >> 1 | $carry$$14$$ << 7;
  this.$f$ = this.$f$ & 236 | $carry$$14$$;
}, $getBC$: function $$JSSMS$Z80$$$$$getBC$$() {
  return this.$b$ << 8 | this.$c$;
}, $getDE$: function $$JSSMS$Z80$$$$$getDE$$() {
  return this.$d$ << 8 | this.$e$;
}, $getHL$: function $$JSSMS$Z80$$$$$getHL$$() {
  return this.$h$ << 8 | this.$l$;
}, $getIX$: function $$JSSMS$Z80$$$$$getIX$$() {
  return this.$ixH$ << 8 | this.$ixL$;
}, $getIY$: function $$JSSMS$Z80$$$$$getIY$$() {
  return this.$iyH$ << 8 | this.$iyL$;
}, $setBC$: function $$JSSMS$Z80$$$$$setBC$$($value$$66$$) {
  this.$b$ = $value$$66$$ >> 8;
  this.$c$ = $value$$66$$ & 255;
}, $setDE$: function $$JSSMS$Z80$$$$$setDE$$($value$$67$$) {
  this.$d$ = $value$$67$$ >> 8;
  this.$e$ = $value$$67$$ & 255;
}, $setHL$: function $$JSSMS$Z80$$$$$setHL$$($value$$68$$) {
  this.$h$ = $value$$68$$ >> 8;
  this.$l$ = $value$$68$$ & 255;
}, $setIX$: function $$JSSMS$Z80$$$$$setIX$$($value$$69$$) {
  this.$ixH$ = $value$$69$$ >> 8;
  this.$ixL$ = $value$$69$$ & 255;
}, $setIY$: function $$JSSMS$Z80$$$$$setIY$$($value$$70$$) {
  this.$iyH$ = $value$$70$$ >> 8;
  this.$iyL$ = $value$$70$$ & 255;
}, $incBC$: function $$JSSMS$Z80$$$$$incBC$$() {
  this.$c$ = this.$c$ + 1 & 255;
  0 == this.$c$ && (this.$b$ = this.$b$ + 1 & 255);
}, $incDE$: function $$JSSMS$Z80$$$$$incDE$$() {
  this.$e$ = this.$e$ + 1 & 255;
  0 == this.$e$ && (this.$d$ = this.$d$ + 1 & 255);
}, $incHL$: function $$JSSMS$Z80$$$$$incHL$$() {
  this.$l$ = this.$l$ + 1 & 255;
  0 == this.$l$ && (this.$h$ = this.$h$ + 1 & 255);
}, $incIX$: function $$JSSMS$Z80$$$$$incIX$$() {
  this.$ixL$ = this.$ixL$ + 1 & 255;
  0 == this.$ixL$ && (this.$ixH$ = this.$ixH$ + 1 & 255);
}, $incIY$: function $$JSSMS$Z80$$$$$incIY$$() {
  this.$iyL$ = this.$iyL$ + 1 & 255;
  0 == this.$iyL$ && (this.$iyH$ = this.$iyH$ + 1 & 255);
}, $decBC$: function $$JSSMS$Z80$$$$$decBC$$() {
  this.$c$ = this.$c$ - 1 & 255;
  255 == this.$c$ && (this.$b$ = this.$b$ - 1 & 255);
}, $decDE$: function $$JSSMS$Z80$$$$$decDE$$() {
  this.$e$ = this.$e$ - 1 & 255;
  255 == this.$e$ && (this.$d$ = this.$d$ - 1 & 255);
}, $decHL$: function $$JSSMS$Z80$$$$$decHL$$() {
  this.$l$ = this.$l$ - 1 & 255;
  255 == this.$l$ && (this.$h$ = this.$h$ - 1 & 255);
}, $decIX$: function $$JSSMS$Z80$$$$$decIX$$() {
  this.$ixL$ = this.$ixL$ - 1 & 255;
  255 == this.$ixL$ && (this.$ixH$ = this.$ixH$ - 1 & 255);
}, $decIY$: function $$JSSMS$Z80$$$$$decIY$$() {
  this.$iyL$ = this.$iyL$ - 1 & 255;
  255 == this.$iyL$ && (this.$iyH$ = this.$iyH$ - 1 & 255);
}, $inc8$: function $$JSSMS$Z80$$$$$inc8$$($value$$71$$) {
  $value$$71$$ = $value$$71$$ + 1 & 255;
  this.$f$ = this.$f$ & 1 | this.$SZHV_INC_TABLE$[$value$$71$$];
  return $value$$71$$;
}, $dec8$: function $$JSSMS$Z80$$$$$dec8$$($value$$72$$) {
  $value$$72$$ = $value$$72$$ - 1 & 255;
  this.$f$ = this.$f$ & 1 | this.$SZHV_DEC_TABLE$[$value$$72$$];
  return $value$$72$$;
}, $exAF$: function $$JSSMS$Z80$$$$$exAF$$() {
  var $temp$$9$$ = this.$a$;
  this.$a$ = this.$a2$;
  this.$a2$ = $temp$$9$$;
  $temp$$9$$ = this.$f$;
  this.$f$ = this.$f2$;
  this.$f2$ = $temp$$9$$;
}, $exBC$: function $$JSSMS$Z80$$$$$exBC$$() {
  var $temp$$10$$ = this.$b$;
  this.$b$ = this.$b2$;
  this.$b2$ = $temp$$10$$;
  $temp$$10$$ = this.$c$;
  this.$c$ = this.$c2$;
  this.$c2$ = $temp$$10$$;
}, $exDE$: function $$JSSMS$Z80$$$$$exDE$$() {
  var $temp$$11$$ = this.$d$;
  this.$d$ = this.$d2$;
  this.$d2$ = $temp$$11$$;
  $temp$$11$$ = this.$e$;
  this.$e$ = this.$e2$;
  this.$e2$ = $temp$$11$$;
}, $exHL$: function $$JSSMS$Z80$$$$$exHL$$() {
  var $temp$$12$$ = this.$h$;
  this.$h$ = this.$h2$;
  this.$h2$ = $temp$$12$$;
  $temp$$12$$ = this.$l$;
  this.$l$ = this.$l2$;
  this.$l2$ = $temp$$12$$;
}, $add16$: function $$JSSMS$Z80$$$$$add16$$($reg$$, $value$$73$$) {
  var $result$$ = $reg$$ + $value$$73$$;
  this.$f$ = this.$f$ & 196 | ($reg$$ ^ $result$$ ^ $value$$73$$) >> 8 & 16 | $result$$ >> 16 & 1;
  return $result$$ & 65535;
}, $adc16$: function $$JSSMS$Z80$$$$$adc16$$($value$$74$$) {
  var $hl$$ = this.$h$ << 8 | this.$l$, $result$$1$$ = $hl$$ + $value$$74$$ + (this.$f$ & 1);
  this.$f$ = ($hl$$ ^ $result$$1$$ ^ $value$$74$$) >> 8 & 16 | $result$$1$$ >> 16 & 1 | $result$$1$$ >> 8 & 128 | (0 != ($result$$1$$ & 65535) ? 0 : 64) | (($value$$74$$ ^ $hl$$ ^ 32768) & ($value$$74$$ ^ $result$$1$$) & 32768) >> 13;
  this.$h$ = $result$$1$$ >> 8 & 255;
  this.$l$ = $result$$1$$ & 255;
}, $sbc16$: function $$JSSMS$Z80$$$$$sbc16$$($value$$75$$) {
  var $hl$$1$$ = this.$h$ << 8 | this.$l$, $result$$2$$ = $hl$$1$$ - $value$$75$$ - (this.$f$ & 1);
  this.$f$ = ($hl$$1$$ ^ $result$$2$$ ^ $value$$75$$) >> 8 & 16 | 2 | $result$$2$$ >> 16 & 1 | $result$$2$$ >> 8 & 128 | (0 != ($result$$2$$ & 65535) ? 0 : 64) | (($value$$75$$ ^ $hl$$1$$) & ($hl$$1$$ ^ $result$$2$$) & 32768) >> 13;
  this.$h$ = $result$$2$$ >> 8 & 255;
  this.$l$ = $result$$2$$ & 255;
}, $generateFlagTables$: function $$JSSMS$Z80$$$$$generateFlagTables$$() {
  this.$SZ_TABLE$ = Array(256);
  this.$SZP_TABLE$ = Array(256);
  this.$SZHV_INC_TABLE$ = Array(256);
  this.$SZHV_DEC_TABLE$ = Array(256);
  this.$SZ_BIT_TABLE$ = Array(256);
  for (var $i$$6_padd$$ = 0; 256 > $i$$6_padd$$; $i$$6_padd$$++) {
    var $padc_sf$$ = 0 != ($i$$6_padd$$ & 128) ? 128 : 0, $psub_zf$$ = 0 == $i$$6_padd$$ ? 64 : 0, $psbc_yf$$ = $i$$6_padd$$ & 32, $oldval_xf$$ = $i$$6_padd$$ & 8, $newval_pf$$ = this.$getParity$($i$$6_padd$$) ? 4 : 0;
    this.$SZ_TABLE$[$i$$6_padd$$] = $padc_sf$$ | $psub_zf$$ | $psbc_yf$$ | $oldval_xf$$;
    this.$SZP_TABLE$[$i$$6_padd$$] = $padc_sf$$ | $psub_zf$$ | $psbc_yf$$ | $oldval_xf$$ | $newval_pf$$;
    this.$SZHV_INC_TABLE$[$i$$6_padd$$] = $padc_sf$$ | $psub_zf$$ | $psbc_yf$$ | $oldval_xf$$;
    this.$SZHV_INC_TABLE$[$i$$6_padd$$] |= 128 == $i$$6_padd$$ ? 4 : 0;
    this.$SZHV_INC_TABLE$[$i$$6_padd$$] |= 0 == ($i$$6_padd$$ & 15) ? 16 : 0;
    this.$SZHV_DEC_TABLE$[$i$$6_padd$$] = $padc_sf$$ | $psub_zf$$ | $psbc_yf$$ | $oldval_xf$$ | 2;
    this.$SZHV_DEC_TABLE$[$i$$6_padd$$] |= 127 == $i$$6_padd$$ ? 4 : 0;
    this.$SZHV_DEC_TABLE$[$i$$6_padd$$] |= 15 == ($i$$6_padd$$ & 15) ? 16 : 0;
    this.$SZ_BIT_TABLE$[$i$$6_padd$$] = 0 != $i$$6_padd$$ ? $i$$6_padd$$ & 128 : 68;
    this.$SZ_BIT_TABLE$[$i$$6_padd$$] |= $psbc_yf$$ | $oldval_xf$$ | 16;
  }
  this.$SZHVC_ADD_TABLE$ = Array(131072);
  this.$SZHVC_SUB_TABLE$ = Array(131072);
  $i$$6_padd$$ = 0;
  $padc_sf$$ = 65536;
  $psub_zf$$ = 0;
  $psbc_yf$$ = 65536;
  for ($oldval_xf$$ = 0; 256 > $oldval_xf$$; $oldval_xf$$++) {
    for ($newval_pf$$ = 0; 256 > $newval_pf$$; $newval_pf$$++) {
      var $val$$ = $newval_pf$$ - $oldval_xf$$;
      this.$SZHVC_ADD_TABLE$[$i$$6_padd$$] = 0 != $newval_pf$$ ? 0 != ($newval_pf$$ & 128) ? 128 : 0 : 64;
      this.$SZHVC_ADD_TABLE$[$i$$6_padd$$] |= $newval_pf$$ & 40;
      ($newval_pf$$ & 15) < ($oldval_xf$$ & 15) && (this.$SZHVC_ADD_TABLE$[$i$$6_padd$$] |= 16);
      $newval_pf$$ < $oldval_xf$$ && (this.$SZHVC_ADD_TABLE$[$i$$6_padd$$] |= 1);
      0 != (($val$$ ^ $oldval_xf$$ ^ 128) & ($val$$ ^ $newval_pf$$) & 128) && (this.$SZHVC_ADD_TABLE$[$i$$6_padd$$] |= 4);
      $i$$6_padd$$++;
      $val$$ = $newval_pf$$ - $oldval_xf$$ - 1;
      this.$SZHVC_ADD_TABLE$[$padc_sf$$] = 0 != $newval_pf$$ ? 0 != ($newval_pf$$ & 128) ? 128 : 0 : 64;
      this.$SZHVC_ADD_TABLE$[$padc_sf$$] |= $newval_pf$$ & 40;
      ($newval_pf$$ & 15) <= ($oldval_xf$$ & 15) && (this.$SZHVC_ADD_TABLE$[$padc_sf$$] |= 16);
      $newval_pf$$ <= $oldval_xf$$ && (this.$SZHVC_ADD_TABLE$[$padc_sf$$] |= 1);
      0 != (($val$$ ^ $oldval_xf$$ ^ 128) & ($val$$ ^ $newval_pf$$) & 128) && (this.$SZHVC_ADD_TABLE$[$padc_sf$$] |= 4);
      $padc_sf$$++;
      $val$$ = $oldval_xf$$ - $newval_pf$$;
      this.$SZHVC_SUB_TABLE$[$psub_zf$$] = 0 != $newval_pf$$ ? 0 != ($newval_pf$$ & 128) ? 130 : 2 : 66;
      this.$SZHVC_SUB_TABLE$[$psub_zf$$] |= $newval_pf$$ & 40;
      ($newval_pf$$ & 15) > ($oldval_xf$$ & 15) && (this.$SZHVC_SUB_TABLE$[$psub_zf$$] |= 16);
      $newval_pf$$ > $oldval_xf$$ && (this.$SZHVC_SUB_TABLE$[$psub_zf$$] |= 1);
      0 != (($val$$ ^ $oldval_xf$$) & ($oldval_xf$$ ^ $newval_pf$$) & 128) && (this.$SZHVC_SUB_TABLE$[$psub_zf$$] |= 4);
      $psub_zf$$++;
      $val$$ = $oldval_xf$$ - $newval_pf$$ - 1;
      this.$SZHVC_SUB_TABLE$[$psbc_yf$$] = 0 != $newval_pf$$ ? 0 != ($newval_pf$$ & 128) ? 130 : 2 : 66;
      this.$SZHVC_SUB_TABLE$[$psbc_yf$$] |= $newval_pf$$ & 40;
      ($newval_pf$$ & 15) >= ($oldval_xf$$ & 15) && (this.$SZHVC_SUB_TABLE$[$psbc_yf$$] |= 16);
      $newval_pf$$ >= $oldval_xf$$ && (this.$SZHVC_SUB_TABLE$[$psbc_yf$$] |= 1);
      0 != (($val$$ ^ $oldval_xf$$) & ($oldval_xf$$ ^ $newval_pf$$) & 128) && (this.$SZHVC_SUB_TABLE$[$psbc_yf$$] |= 4);
      $psbc_yf$$++;
    }
  }
}, $getParity$: function $$JSSMS$Z80$$$$$getParity$$($value$$76$$) {
  for (var $parity$$ = $JSCompiler_alias_TRUE$$, $j$$1$$ = 0; 8 > $j$$1$$; $j$$1$$++) {
    0 != ($value$$76$$ & 1 << $j$$1$$) && ($parity$$ = !$parity$$);
  }
  return $parity$$;
}, $getDummyWrite$: function $$JSSMS$Z80$$$$$getDummyWrite$$() {
  return Array(1024);
}, $generateMemory$: function $$JSSMS$Z80$$$$$generateMemory$$() {
  for (var $i$$7$$ = 0; 65 > $i$$7$$; $i$$7$$++) {
    this.$memReadMap$[$i$$7$$] = Array(1024), this.$memWriteMap$[$i$$7$$] = Array(1024);
  }
  for ($i$$7$$ = 0; 8 > $i$$7$$; $i$$7$$++) {
    this.$ram$[$i$$7$$] = Array(1024);
  }
  this.$sram$ == $JSCompiler_alias_NULL$$ && (this.$sram$ = Array(32));
  this.$memReadMap$[64] = this.$getDummyWrite$();
  this.$memWriteMap$[64] = this.$getDummyWrite$();
  this.$number_of_pages$ = 2;
}, $resetMemory$: function $$JSSMS$Z80$$$$$resetMemory$$($p$$) {
  $p$$ != $JSCompiler_alias_NULL$$ && (this.$rom$ = $p$$);
  this.$frameReg$[0] = 0;
  this.$frameReg$[1] = 0;
  this.$frameReg$[2] = 1;
  this.$frameReg$[3] = 0;
  this.$rom$ != $JSCompiler_alias_NULL$$ ? (this.$number_of_pages$ = this.$rom$.length / 16, this.$setDefaultMemoryMapping$()) : this.$number_of_pages$ = 0;
}, $setDefaultMemoryMapping$: function $$JSSMS$Z80$$$$$setDefaultMemoryMapping$$() {
  for (var $i$$8$$ = 0; 48 > $i$$8$$; $i$$8$$++) {
    this.$memReadMap$[$i$$8$$] = $JSSMS$Utils$copyArray$$(this.$rom$[$i$$8$$ & 31]), this.$memWriteMap$[$i$$8$$] = this.$getDummyWrite$();
  }
  for ($i$$8$$ = 48; 64 > $i$$8$$; $i$$8$$++) {
    this.$memReadMap$[$i$$8$$] = this.$ram$[$i$$8$$ & 7], this.$memWriteMap$[$i$$8$$] = this.$ram$[$i$$8$$ & 7];
  }
}, $writeMem$: function $$JSSMS$Z80$$$$$writeMem$$($address$$, $value$$77$$) {
  if ($address$$ >> 10 >= this.$memWriteMap$.length || !this.$memWriteMap$[$address$$ >> 10] || ($address$$ & 1023) >= this.$memWriteMap$[$address$$ >> 10].length) {
    console.log($address$$, $address$$ >> 10, $address$$ & 1023);
    debugger;
  }
  this.$memWriteMap$[$address$$ >> 10][$address$$ & 1023] = $value$$77$$;
  65532 <= $address$$ && this.page($address$$ & 3, $value$$77$$);
}, $readMem$: function $$JSSMS$Z80$$$$$readMem$$($address$$1$$) {
  if ($address$$1$$ >> 10 >= this.$memReadMap$.length || !this.$memReadMap$[$address$$1$$ >> 10] || ($address$$1$$ & 1023) >= this.$memReadMap$[$address$$1$$ >> 10].length) {
    console.log($address$$1$$, $address$$1$$ >> 10, $address$$1$$ & 1023);
    debugger;
  }
  return this.$memReadMap$[$address$$1$$ >> 10][$address$$1$$ & 1023] & 255;
}, $d_$: function $$JSSMS$Z80$$$$$d_$$() {
  return this.$memReadMap$[this.$pc$ >> 10][this.$pc$ & 1023];
}, $readMemWord$: function $$JSSMS$Z80$$$$$readMemWord$$($address$$2$$) {
  return this.$memReadMap$[$address$$2$$ >> 10][$address$$2$$ & 1023] & 255 | (this.$memReadMap$[++$address$$2$$ >> 10][$address$$2$$ & 1023] & 255) << 8;
}, page: function $$JSSMS$Z80$$$$page$($address$$3$$, $value$$78$$) {
  this.$frameReg$[$address$$3$$] = $value$$78$$;
  switch ($address$$3$$) {
    case 0:
      if (0 != ($value$$78$$ & 8)) {
        for (var $offset$$16_p$$1$$ = ($value$$78$$ & 4) << 2, $i$$9$$ = 32; 48 > $i$$9$$; $i$$9$$++) {
          this.$memReadMap$[$i$$9$$] = $JSSMS$Utils$copyArray$$(this.$sram$[$offset$$16_p$$1$$]), this.$memWriteMap$[$i$$9$$] = $JSSMS$Utils$copyArray$$(this.$sram$[$offset$$16_p$$1$$]), $offset$$16_p$$1$$++;
        }
      }else {
        $offset$$16_p$$1$$ = this.$frameReg$[3] % this.$number_of_pages$ << 4;
        for ($i$$9$$ = 32; 48 > $i$$9$$; $i$$9$$++) {
          this.$memReadMap$[$i$$9$$] = $JSSMS$Utils$copyArray$$(this.$rom$[$offset$$16_p$$1$$++]), this.$memWriteMap$[$i$$9$$] = this.$getDummyWrite$();
        }
      }
      break;
    case 1:
      $offset$$16_p$$1$$ = ($value$$78$$ % this.$number_of_pages$ << 4) + 1;
      for ($i$$9$$ = 1; 16 > $i$$9$$; $i$$9$$++) {
        this.$memReadMap$[$i$$9$$] = $JSSMS$Utils$copyArray$$(this.$rom$[$offset$$16_p$$1$$++]);
      }
      break;
    case 2:
      $offset$$16_p$$1$$ = $value$$78$$ % this.$number_of_pages$ << 4;
      for ($i$$9$$ = 16; 32 > $i$$9$$; $i$$9$$++) {
        this.$memReadMap$[$i$$9$$] = $JSSMS$Utils$copyArray$$(this.$rom$[$offset$$16_p$$1$$++]);
      }
      break;
    case 3:
      if (0 == (this.$frameReg$[0] & 8)) {
        $offset$$16_p$$1$$ = $value$$78$$ % this.$number_of_pages$ << 4;
        for ($i$$9$$ = 32; 48 > $i$$9$$; $i$$9$$++) {
          this.$memReadMap$[$i$$9$$] = $JSSMS$Utils$copyArray$$(this.$rom$[$offset$$16_p$$1$$++]);
        }
      }
  }
}};
function $JSSMS$Keyboard$$($sms$$1$$) {
  this.$main$ = $sms$$1$$;
  this.$ggstart$ = this.$controller2$ = this.$controller1$ = 0;
}
$JSSMS$Keyboard$$.prototype = {reset: function $$JSSMS$Keyboard$$$$reset$() {
  this.$ggstart$ = this.$controller2$ = this.$controller1$ = 255;
  this.$pause_button$ = $JSCompiler_alias_FALSE$$;
}, keydown: function $$JSSMS$Keyboard$$$$keydown$($evt$$14$$) {
  switch ($evt$$14$$.keyCode) {
    case 38:
      this.$controller1$ &= -2;
      break;
    case 40:
      this.$controller1$ &= -3;
      break;
    case 37:
      this.$controller1$ &= -5;
      break;
    case 39:
      this.$controller1$ &= -9;
      break;
    case 88:
      this.$controller1$ &= -17;
      break;
    case 90:
      this.$controller1$ &= -33;
      break;
    case 13:
      this.$main$.$is_sms$ ? this.$main$.$pause_button$ = $JSCompiler_alias_TRUE$$ : this.$ggstart$ &= -129;
      break;
    case 104:
      this.$controller2$ &= -2;
      break;
    case 98:
      this.$controller2$ &= -3;
      break;
    case 100:
      this.$controller2$ &= -5;
      break;
    case 102:
      this.$controller2$ &= -9;
      break;
    case 103:
      this.$controller2$ &= -17;
      break;
    case 105:
      this.$controller2$ &= -33;
      break;
    case 97:
      this.$controller2$ &= -65;
      break;
    default:
      return;
  }
  $evt$$14$$.preventDefault();
}, keyup: function $$JSSMS$Keyboard$$$$keyup$($evt$$15$$) {
  switch ($evt$$15$$.keyCode) {
    case 38:
      this.$controller1$ |= 1;
      break;
    case 40:
      this.$controller1$ |= 2;
      break;
    case 37:
      this.$controller1$ |= 4;
      break;
    case 39:
      this.$controller1$ |= 8;
      break;
    case 88:
      this.$controller1$ |= 16;
      break;
    case 90:
      this.$controller1$ |= 32;
      break;
    case 13:
      this.$main$.$is_sms$ || (this.$ggstart$ |= 128);
      break;
    case 104:
      this.$controller2$ |= 1;
      break;
    case 98:
      this.$controller2$ |= 2;
      break;
    case 100:
      this.$controller2$ |= 4;
      break;
    case 102:
      this.$controller2$ |= 8;
      break;
    case 103:
      this.$controller2$ |= 16;
      break;
    case 105:
      this.$controller2$ |= 32;
      break;
    case 97:
      this.$controller2$ |= 64;
      break;
    default:
      return;
  }
  $evt$$15$$.preventDefault();
}};
var $NO_ANTIALIAS$$ = Number.MIN_VALUE, $PSG_VOLUME$$ = [25, 20, 16, 13, 10, 8, 6, 5, 4, 3, 3, 2, 2, 1, 1, 0];
function $JSSMS$SN76489$$($sms$$2$$) {
  this.$main$ = $sms$$2$$;
  this.$clockFrac$ = this.$clock$ = 0;
  this.$reg$ = Array(8);
  this.$regLatch$ = 0;
  this.$freqCounter$ = Array(4);
  this.$freqPolarity$ = Array(4);
  this.$freqPos$ = Array(3);
  this.$noiseFreq$ = 16;
  this.$noiseShiftReg$ = 32768;
  this.$outputChannel$ = Array(4);
}
$JSSMS$SN76489$$.prototype = {$init$: function $$JSSMS$SN76489$$$$$init$$($clockSpeed$$, $sampleRate$$1$$) {
  this.$clock$ = ($clockSpeed$$ << 8) / 16 / $sampleRate$$1$$;
  this.$regLatch$ = this.$clockFrac$ = 0;
  this.$noiseFreq$ = 16;
  this.$noiseShiftReg$ = 32768;
  for (var $i$$11$$ = 0; 4 > $i$$11$$; $i$$11$$++) {
    this.$reg$[$i$$11$$ << 1] = 1, this.$reg$[($i$$11$$ << 1) + 1] = 15, this.$freqCounter$[$i$$11$$] = 0, this.$freqPolarity$[$i$$11$$] = 1, 3 != $i$$11$$ && (this.$freqPos$[$i$$11$$] = $NO_ANTIALIAS$$);
  }
}, write: function $$JSSMS$SN76489$$$$write$($value$$79$$) {
  0 != ($value$$79$$ & 128) ? (this.$regLatch$ = $value$$79$$ >> 4 & 7, this.$reg$[this.$regLatch$] = this.$reg$[this.$regLatch$] & 1008 | $value$$79$$ & 15) : this.$reg$[this.$regLatch$] = 0 == this.$regLatch$ || 2 == this.$regLatch$ || 4 == this.$regLatch$ ? this.$reg$[this.$regLatch$] & 15 | ($value$$79$$ & 63) << 4 : $value$$79$$ & 15;
  switch (this.$regLatch$) {
    case 0:
;
    case 2:
;
    case 4:
      0 == this.$reg$[this.$regLatch$] && (this.$reg$[this.$regLatch$] = 1);
      break;
    case 6:
      this.$noiseFreq$ = 16 << (this.$reg$[6] & 3), this.$noiseShiftReg$ = 32768;
  }
}, update: function $$JSSMS$SN76489$$$$update$($buffer$$10$$, $offset$$17$$, $samplesToGenerate$$1$$) {
  var $sample$$, $i$$12_output$$2$$;
  for ($sample$$ = 0; $sample$$ < $samplesToGenerate$$1$$; $sample$$++) {
    for ($i$$12_output$$2$$ = 0; 3 > $i$$12_output$$2$$; $i$$12_output$$2$$++) {
      this.$outputChannel$[$i$$12_output$$2$$] = this.$freqPos$[$i$$12_output$$2$$] != $NO_ANTIALIAS$$ ? $PSG_VOLUME$$[this.$reg$[($i$$12_output$$2$$ << 1) + 1]] * this.$freqPos$[$i$$12_output$$2$$] >> 8 : $PSG_VOLUME$$[this.$reg$[($i$$12_output$$2$$ << 1) + 1]] * this.$freqPolarity$[$i$$12_output$$2$$];
    }
    this.$outputChannel$[3] = $PSG_VOLUME$$[this.$reg$[7]] * (this.$noiseShiftReg$ & 1) << 1;
    $i$$12_output$$2$$ = this.$outputChannel$[0] + this.$outputChannel$[1] + this.$outputChannel$[2] + this.$outputChannel$[3];
    127 < $i$$12_output$$2$$ ? $i$$12_output$$2$$ = 127 : -128 > $i$$12_output$$2$$ && ($i$$12_output$$2$$ = -128);
    $buffer$$10$$[$offset$$17$$ + $sample$$] = $i$$12_output$$2$$;
    this.$clockFrac$ += this.$clock$;
    var $clockCycles$$ = this.$clockFrac$ >> 8, $clockCyclesScaled$$ = $clockCycles$$ << 8;
    this.$clockFrac$ -= $clockCyclesScaled$$;
    this.$freqCounter$[0] -= $clockCycles$$;
    this.$freqCounter$[1] -= $clockCycles$$;
    this.$freqCounter$[2] -= $clockCycles$$;
    this.$freqCounter$[3] = 128 == this.$noiseFreq$ ? this.$freqCounter$[2] : this.$freqCounter$[3] - $clockCycles$$;
    for ($i$$12_output$$2$$ = 0; 3 > $i$$12_output$$2$$; $i$$12_output$$2$$++) {
      var $counter$$ = this.$freqCounter$[$i$$12_output$$2$$];
      if (0 >= $counter$$) {
        var $tone$$ = this.$reg$[$i$$12_output$$2$$ << 1];
        6 < $tone$$ ? (this.$freqPos$[$i$$12_output$$2$$] = ($clockCyclesScaled$$ - this.$clockFrac$ + 512 * $counter$$ << 8) * this.$freqPolarity$[$i$$12_output$$2$$] / ($clockCyclesScaled$$ + this.$clockFrac$), this.$freqPolarity$[$i$$12_output$$2$$] = -this.$freqPolarity$[$i$$12_output$$2$$]) : (this.$freqPolarity$[$i$$12_output$$2$$] = 1, this.$freqPos$[$i$$12_output$$2$$] = $NO_ANTIALIAS$$);
        this.$freqCounter$[$i$$12_output$$2$$] += $tone$$ * ($clockCycles$$ / $tone$$ + 1);
      }else {
        this.$freqPos$[$i$$12_output$$2$$] = $NO_ANTIALIAS$$;
      }
    }
    0 >= this.$freqCounter$[3] && (this.$freqPolarity$[3] = -this.$freqPolarity$[3], 128 != this.$noiseFreq$ && (this.$freqCounter$[3] += this.$noiseFreq$ * ($clockCycles$$ / this.$noiseFreq$ + 1)), 1 == this.$freqPolarity$[3] && (this.$noiseShiftReg$ = this.$noiseShiftReg$ >> 1 | (0 != (this.$reg$[6] & 4) ? 0 != (this.$noiseShiftReg$ & 9) && 0 != (this.$noiseShiftReg$ & 9 ^ 9) ? 1 : 0 : this.$noiseShiftReg$ & 1) << 15));
  }
  return $buffer$$10$$;
}};
function $JSSMS$Vdp$$($i$$13_sms$$3$$) {
  this.$main$ = $i$$13_sms$$3$$;
  this.$videoMode$ = 0;
  this.$VRAM$ = Array(16384);
  this.$CRAM$ = Array(32);
  for ($i$$13_sms$$3$$ = 0; 32 > $i$$13_sms$$3$$; $i$$13_sms$$3$$++) {
    this.$CRAM$[$i$$13_sms$$3$$] = 0;
  }
  this.$vdpreg$ = Array(16);
  this.status = 0;
  this.$firstByte$ = $JSCompiler_alias_FALSE$$;
  this.$counter$ = this.$line$ = this.$readBuffer$ = this.$operation$ = this.location = this.$commandByte$ = 0;
  this.$bgPriority$ = Array(256);
  this.$spriteCol$ = Array(256);
  this.$vScrollLatch$ = this.$bgt$ = 0;
  this.display = Array(49152);
  this.$main_JAVA$ = [];
  this.$GG_JAVA1$ = [];
  this.$GG_JAVA2$ = [];
  this.$sat$ = this.$h_end$ = this.$h_start$ = 0;
  this.$isSatDirty$ = $JSCompiler_alias_FALSE$$;
  this.$lineSprites$ = Array(192);
  for ($i$$13_sms$$3$$ = 0; 192 > $i$$13_sms$$3$$; $i$$13_sms$$3$$++) {
    this.$lineSprites$[$i$$13_sms$$3$$] = Array(25);
  }
  this.$tiles$ = Array(512);
  this.$isTileDirty$ = Array(512);
  this.$maxDirty$ = this.$minDirty$ = 0;
  this.$createCachedImages$();
}
$JSSMS$Vdp$$.prototype = {reset: function $$JSSMS$Vdp$$$$reset$() {
  var $i$$14$$;
  this.$generateConvertedPals$();
  this.$firstByte$ = $JSCompiler_alias_TRUE$$;
  for ($i$$14$$ = this.$operation$ = this.status = this.$counter$ = this.location = 0; 16 > $i$$14$$; $i$$14$$++) {
    this.$vdpreg$[$i$$14$$] = 0;
  }
  this.$vdpreg$[2] = 14;
  this.$vdpreg$[5] = 126;
  this.$vScrollLatch$ = 0;
  this.$main$.$cpu$.$interruptLine$ = $JSCompiler_alias_FALSE$$;
  this.$isSatDirty$ = $JSCompiler_alias_TRUE$$;
  this.$minDirty$ = 512;
  this.$maxDirty$ = -1;
  for ($i$$14$$ = 0; 16384 > $i$$14$$; $i$$14$$++) {
    this.$VRAM$[$i$$14$$] = 0;
  }
  for ($i$$14$$ = 0; 49152 > $i$$14$$; $i$$14$$++) {
    this.display[$i$$14$$] = 0;
  }
}, $forceFullRedraw$: function $$JSSMS$Vdp$$$$$forceFullRedraw$$() {
  this.$bgt$ = (this.$vdpreg$[2] & 14) << 10;
  this.$minDirty$ = 0;
  this.$maxDirty$ = 511;
  for (var $i$$15$$ = 0, $l$$1$$ = this.$isTileDirty$.length; $i$$15$$ < $l$$1$$; $i$$15$$++) {
    this.$isTileDirty$[$i$$15$$] = $JSCompiler_alias_TRUE$$;
  }
  this.$sat$ = (this.$vdpreg$[5] & -130) << 7;
  this.$isSatDirty$ = $JSCompiler_alias_TRUE$$;
}, $getVCount$: function $$JSSMS$Vdp$$$$$getVCount$$() {
  if (0 == this.$videoMode$) {
    if (218 < this.$line$) {
      return this.$line$ - 6;
    }
  }else {
    if (242 < this.$line$) {
      return this.$line$ - 57;
    }
  }
  return this.$line$;
}, $controlRead$: function $$JSSMS$Vdp$$$$$controlRead$$() {
  this.$firstByte$ = $JSCompiler_alias_TRUE$$;
  var $statuscopy$$ = this.status;
  this.status = 0;
  this.$main$.$cpu$.$interruptLine$ = $JSCompiler_alias_FALSE$$;
  return $statuscopy$$;
}, $controlWrite$: function $$JSSMS$Vdp$$$$$controlWrite$$($reg$$1_value$$80$$) {
  if (this.$firstByte$) {
    this.$firstByte$ = $JSCompiler_alias_FALSE$$, this.$commandByte$ = $reg$$1_value$$80$$, this.location = this.location & 16128 | $reg$$1_value$$80$$;
  }else {
    if (this.$firstByte$ = $JSCompiler_alias_TRUE$$, this.$operation$ = $reg$$1_value$$80$$ >> 6 & 3, this.location = this.$commandByte$ | $reg$$1_value$$80$$ << 8, 0 == this.$operation$) {
      this.$readBuffer$ = this.$VRAM$[this.location++ & 16383] & 255;
    }else {
      if (2 == this.$operation$) {
        $reg$$1_value$$80$$ &= 15;
        switch ($reg$$1_value$$80$$) {
          case 0:
            0 != (this.status & 4) && (this.$main$.$cpu$.$interruptLine$ = 0 != (this.$commandByte$ & 16));
            break;
          case 1:
            0 != (this.status & 128) && 0 != (this.$commandByte$ & 32) && (this.$main$.$cpu$.$interruptLine$ = $JSCompiler_alias_TRUE$$);
            (this.$commandByte$ & 3) != (this.$vdpreg$[$reg$$1_value$$80$$] & 3) && (this.$isSatDirty$ = $JSCompiler_alias_TRUE$$);
            break;
          case 2:
            this.$bgt$ = (this.$commandByte$ & 14) << 10;
            break;
          case 5:
            var $old$$ = this.$sat$;
            this.$sat$ = (this.$commandByte$ & -130) << 7;
            $old$$ != this.$sat$ && (this.$isSatDirty$ = $JSCompiler_alias_TRUE$$, console.log('New address written to SAT: ' + $old$$ + ' -> ' + this.$sat$));
        }
        this.$vdpreg$[$reg$$1_value$$80$$] = this.$commandByte$;
      }
    }
  }
}, $dataRead$: function $$JSSMS$Vdp$$$$$dataRead$$() {
  this.$firstByte$ = $JSCompiler_alias_TRUE$$;
  var $value$$81$$ = this.$readBuffer$;
  this.$readBuffer$ = this.$VRAM$[this.location++ & 16383] & 255;
  return $value$$81$$;
}, $dataWrite$: function $$JSSMS$Vdp$$$$$dataWrite$$($value$$82$$) {
  this.$firstByte$ = $JSCompiler_alias_TRUE$$;
  switch (this.$operation$) {
    case 0:
;
    case 1:
;
    case 2:
      var $address$$4$$ = this.location & 16383;
      if ($value$$82$$ != (this.$VRAM$[$address$$4$$] & 255)) {
        if ($address$$4$$ >= this.$sat$ && $address$$4$$ < this.$sat$ + 64) {
          this.$isSatDirty$ = $JSCompiler_alias_TRUE$$;
        }else {
          if ($address$$4$$ >= this.$sat$ + 128 && $address$$4$$ < this.$sat$ + 256) {
            this.$isSatDirty$ = $JSCompiler_alias_TRUE$$;
          }else {
            var $tileIndex$$ = $address$$4$$ >> 5;
            this.$isTileDirty$[$tileIndex$$] = $JSCompiler_alias_TRUE$$;
            $tileIndex$$ < this.$minDirty$ && (this.$minDirty$ = $tileIndex$$);
            $tileIndex$$ > this.$maxDirty$ && (this.$maxDirty$ = $tileIndex$$);
          }
        }
        this.$VRAM$[$address$$4$$] = $value$$82$$;
      }
      break;
    case 3:
      this.$main$.$is_sms$ ? this.$CRAM$[this.location & 31] = this.$main_JAVA$[$value$$82$$ & 63] : this.$main$.$is_gg$ && (this.$CRAM$[(this.location & 63) >> 1] = 0 == (this.location & 1) ? this.$GG_JAVA1$[$value$$82$$] : this.$CRAM$[(this.location & 63) >> 1] | this.$GG_JAVA2$[$value$$82$$ & 15]);
  }
  this.$readBuffer$ = $value$$82$$;
  this.location++;
}, $interrupts$: function $$JSSMS$Vdp$$$$$interrupts$$($lineno$$1$$) {
  if (192 >= $lineno$$1$$) {
    if (0 == this.$counter$ ? (this.$counter$ = this.$vdpreg$[10], this.status |= 4) : this.$counter$--, 0 != (this.status & 4) && 0 != (this.$vdpreg$[0] & 16)) {
      this.$main$.$cpu$.$interruptLine$ = $JSCompiler_alias_TRUE$$;
    }
  }else {
    if (this.$counter$ = this.$vdpreg$[10], 0 != (this.status & 128) && (0 != (this.$vdpreg$[1] & 32) && 224 > $lineno$$1$$) && (this.$main$.$cpu$.$interruptLine$ = $JSCompiler_alias_TRUE$$), $lineno$$1$$ == this.$main$.$no_of_scanlines$ - 1) {
      this.$vScrollLatch$ = this.$vdpreg$[9];
    }
  }
}, $setVBlankFlag$: function $$JSSMS$Vdp$$$$$setVBlankFlag$$() {
  this.status |= 128;
}, $drawLine$: function $$JSSMS$Vdp$$$$$drawLine$$($lineno$$2_location$$26$$) {
  if (!this.$main$.$is_gg$ || !(24 > $lineno$$2_location$$26$$ || 168 <= $lineno$$2_location$$26$$)) {
    for (var $colour_i$$16$$ = this.$spriteCol$.length; 0 != $colour_i$$16$$--;) {
      this.$spriteCol$[$colour_i$$16$$] = $JSCompiler_alias_FALSE$$;
    }
    if (0 != (this.$vdpreg$[1] & 64)) {
      if (-1 != this.$maxDirty$ && this.$decodeTiles$(), this.$drawBg$($lineno$$2_location$$26$$), this.$isSatDirty$ && this.$decodeSat$(), 0 != this.$lineSprites$[$lineno$$2_location$$26$$][0] && this.$drawSprite$($lineno$$2_location$$26$$), this.$main$.$is_sms$ && 0 != (this.$vdpreg$[0] & 32)) {
        $colour_i$$16$$ = this.$CRAM$[16 + (this.$vdpreg$[7] & 15)];
        $lineno$$2_location$$26$$ <<= 8;
        if (32 < 16 + (this.$vdpreg$[7] & 15)) {
          debugger;
        }
        if (49152 < $lineno$$2_location$$26$$) {
          debugger;
        }
        this.display[$lineno$$2_location$$26$$++] = $colour_i$$16$$;
        this.display[$lineno$$2_location$$26$$++] = $colour_i$$16$$;
        this.display[$lineno$$2_location$$26$$++] = $colour_i$$16$$;
        this.display[$lineno$$2_location$$26$$++] = $colour_i$$16$$;
        this.display[$lineno$$2_location$$26$$++] = $colour_i$$16$$;
        this.display[$lineno$$2_location$$26$$++] = $colour_i$$16$$;
        this.display[$lineno$$2_location$$26$$++] = $colour_i$$16$$;
        this.display[$lineno$$2_location$$26$$] = $colour_i$$16$$;
      }
    }else {
      this.$drawBGColour$($lineno$$2_location$$26$$);
    }
  }
}, $drawBg$: function $$JSSMS$Vdp$$$$$drawBg$$($lineno$$3$$) {
  var $hscroll$$ = this.$vdpreg$[8], $tile_y_vscroll$$ = this.$vScrollLatch$;
  16 > $lineno$$3$$ && 0 != (this.$vdpreg$[0] & 64) && ($hscroll$$ = 0);
  var $lock$$ = this.$vdpreg$[0] & 128, $tile_column$$ = 32 - ($hscroll$$ >> 3) + this.$h_start$, $tile_row$$ = $lineno$$3$$ + $tile_y_vscroll$$ >> 3;
  27 < $tile_row$$ && ($tile_row$$ -= 28);
  for (var $tile_y_vscroll$$ = ($lineno$$3$$ + ($tile_y_vscroll$$ & 7) & 7) << 3, $rowprecal$$ = $lineno$$3$$ << 8, $tx$$ = this.$h_start$; $tx$$ < this.$h_end$; $tx$$++) {
    var $tile_tile_props$$ = this.$bgt$ + (($tile_column$$ & 31) << 1) + ($tile_row$$ << 6), $secondbyte$$ = this.$VRAM$[$tile_tile_props$$ + 1], $pal$$ = ($secondbyte$$ & 8) << 1, $sx$$1$$ = ($tx$$ << 3) + ($hscroll$$ & 7), $pixY$$ = 0 == ($secondbyte$$ & 4) ? $tile_y_vscroll$$ : 56 - $tile_y_vscroll$$, $tile_tile_props$$ = this.$tiles$[(this.$VRAM$[$tile_tile_props$$] & 255) + (($secondbyte$$ & 1) << 8)];
    if (0 == ($secondbyte$$ & 2)) {
      for (var $pixX$$ = 0; 8 > $pixX$$ && 256 > $sx$$1$$; $pixX$$++, $sx$$1$$++) {
        var $colour$$1$$ = $tile_tile_props$$[$pixX$$ + $pixY$$];
        this.$bgPriority$[$sx$$1$$] = 0 != ($secondbyte$$ & 16) && 0 != $colour$$1$$;
        this.display[$sx$$1$$ + $rowprecal$$] = this.$CRAM$[$colour$$1$$ + $pal$$];
      }
    }else {
      for ($pixX$$ = 7; 0 <= $pixX$$ && 256 > $sx$$1$$; $pixX$$--, $sx$$1$$++) {
        $colour$$1$$ = $tile_tile_props$$[$pixX$$ + $pixY$$], this.$bgPriority$[$sx$$1$$] = 0 != ($secondbyte$$ & 16) && 0 != $colour$$1$$, this.display[$sx$$1$$ + $rowprecal$$] = this.$CRAM$[$colour$$1$$ + $pal$$];
      }
    }
    $tile_column$$++;
    0 != $lock$$ && 23 == $tx$$ && ($tile_row$$ = $lineno$$3$$ >> 3, $tile_y_vscroll$$ = ($lineno$$3$$ & 7) << 3);
  }
}, $drawSprite$: function $$JSSMS$Vdp$$$$$drawSprite$$($lineno$$4$$) {
  for (var $sprites$$ = this.$lineSprites$[$lineno$$4$$], $count$$6_i$$17$$ = Math.min(8, $sprites$$[0]), $zoomed$$ = this.$vdpreg$[1] & 1, $row_precal$$ = $lineno$$4$$ << 8, $off$$ = 3 * $count$$6_i$$17$$; 0 != $count$$6_i$$17$$--;) {
    var $n$$2_tile$$1$$ = $sprites$$[$off$$--] | (this.$vdpreg$[6] & 4) << 6, $pix_y$$41$$ = $sprites$$[$off$$--], $x$$58$$ = $sprites$$[$off$$--] - (this.$vdpreg$[0] & 8), $offset$$18_tileRow$$ = $lineno$$4$$ - $pix_y$$41$$ >> $zoomed$$;
    0 != (this.$vdpreg$[1] & 2) && ($n$$2_tile$$1$$ &= -2);
    $n$$2_tile$$1$$ = this.$tiles$[$n$$2_tile$$1$$ + (($offset$$18_tileRow$$ & 8) >> 3)];
    $pix_y$$41$$ = 0;
    0 > $x$$58$$ && ($pix_y$$41$$ = -$x$$58$$, $x$$58$$ = 0);
    $offset$$18_tileRow$$ = $pix_y$$41$$ + (($offset$$18_tileRow$$ & 7) << 3);
    if (0 == $zoomed$$) {
      for (; 8 > $pix_y$$41$$ && 256 > $x$$58$$; $pix_y$$41$$++, $x$$58$$++) {
        var $colour$$2$$ = $n$$2_tile$$1$$[$offset$$18_tileRow$$++];
        0 != $colour$$2$$ && !this.$bgPriority$[$x$$58$$] && (this.display[$x$$58$$ + $row_precal$$] = this.$CRAM$[$colour$$2$$ + 16], this.$spriteCol$[$x$$58$$] ? this.status |= 32 : this.$spriteCol$[$x$$58$$] = $JSCompiler_alias_TRUE$$);
      }
    }else {
      for (; 8 > $pix_y$$41$$ && 256 > $x$$58$$; $pix_y$$41$$++, $x$$58$$ += 2) {
        if ($colour$$2$$ = $n$$2_tile$$1$$[$offset$$18_tileRow$$++], 0 != $colour$$2$$ && !this.$bgPriority$[$x$$58$$] && (this.display[$x$$58$$ + $row_precal$$] = this.$CRAM$[$colour$$2$$ + 16], this.$spriteCol$[$x$$58$$] ? this.status |= 32 : this.$spriteCol$[$x$$58$$] = $JSCompiler_alias_TRUE$$), 0 != $colour$$2$$ && !this.$bgPriority$[$x$$58$$ + 1]) {
          this.display[$x$$58$$ + $row_precal$$ + 1] = this.$CRAM$[$colour$$2$$ + 16], this.$spriteCol$[$x$$58$$ + 1] ? this.status |= 32 : this.$spriteCol$[$x$$58$$ + 1] = $JSCompiler_alias_TRUE$$;
        }
      }
    }
  }
  8 <= $sprites$$[0] && (this.status |= 64);
}, $drawBGColour$: function $$JSSMS$Vdp$$$$$drawBGColour$$($lineno$$5_row_precal$$1$$) {
  var $colour$$3$$ = this.$CRAM$[16 + (this.$vdpreg$[7] & 15)], $lineno$$5_row_precal$$1$$ = $lineno$$5_row_precal$$1$$ << 8, $i$$18$$;
  for ($i$$18$$ = 0; 256 > $i$$18$$; $i$$18$$++) {
    this.display[$lineno$$5_row_precal$$1$$++] = $colour$$3$$;
  }
}, $generateConvertedPals$: function $$JSSMS$Vdp$$$$$generateConvertedPals$$() {
  var $i$$19$$, $r$$, $g$$, $b$$1$$;
  if (this.$main$.$is_sms$ && !this.$main_JAVA$.length) {
    this.$main_JAVA$ = Array(64);
    for ($i$$19$$ = 0; 64 > $i$$19$$; $i$$19$$++) {
      $r$$ = $i$$19$$ & 3, $g$$ = $i$$19$$ >> 2 & 3, $b$$1$$ = $i$$19$$ >> 4 & 3, this.$main_JAVA$[$i$$19$$] = 85 * $r$$ | 85 * $g$$ << 8 | 85 * $b$$1$$ << 16;
    }
  }else {
    if (this.$main$.$is_gg$ && !this.$GG_JAVA1$.length) {
      this.$GG_JAVA1$ = Array(256);
      this.$GG_JAVA2$ = Array(16);
      for ($i$$19$$ = 0; 256 > $i$$19$$; $i$$19$$++) {
        $g$$ = $i$$19$$ & 15, $b$$1$$ = $i$$19$$ >> 4 & 15, this.$GG_JAVA1$[$i$$19$$] = $b$$1$$ << 12 | $b$$1$$ << 8 | $g$$ << 4 | $g$$;
      }
      for ($i$$19$$ = 0; 16 > $i$$19$$; $i$$19$$++) {
        this.$GG_JAVA2$[$i$$19$$] = $i$$19$$ << 20;
      }
    }
  }
}, $createCachedImages$: function $$JSSMS$Vdp$$$$$createCachedImages$$() {
  for (var $i$$20$$ = 0; 512 > $i$$20$$; $i$$20$$++) {
    this.$tiles$[$i$$20$$] = Array(64);
  }
}, $decodeTiles$: function $$JSSMS$Vdp$$$$$decodeTiles$$() {
  console.log('[' + this.$line$ + '] min dirty:' + this.$minDirty$ + ' max: ' + this.$maxDirty$);
  for (var $i$$21$$ = this.$minDirty$; $i$$21$$ <= this.$maxDirty$; $i$$21$$++) {
    if (this.$isTileDirty$[$i$$21$$]) {
      this.$isTileDirty$[$i$$21$$] = $JSCompiler_alias_FALSE$$;
      console.log('tile ' + $i$$21$$ + ' is dirty');
      for (var $tile$$2$$ = this.$tiles$[$i$$21$$], $pixel_index$$ = 0, $address$$5$$ = $i$$21$$ << 5, $y$$42$$ = 0; 8 > $y$$42$$; $y$$42$$++) {
        for (var $address0$$ = this.$VRAM$[$address$$5$$++], $address1$$ = this.$VRAM$[$address$$5$$++], $address2$$ = this.$VRAM$[$address$$5$$++], $address3$$ = this.$VRAM$[$address$$5$$++], $bit$$ = 128; 0 != $bit$$; $bit$$ >>= 1) {
          var $colour$$4$$ = 0;
          0 != ($address0$$ & $bit$$) && ($colour$$4$$ |= 1);
          0 != ($address1$$ & $bit$$) && ($colour$$4$$ |= 2);
          0 != ($address2$$ & $bit$$) && ($colour$$4$$ |= 4);
          0 != ($address3$$ & $bit$$) && ($colour$$4$$ |= 8);
          $tile$$2$$[$pixel_index$$++] = $colour$$4$$;
        }
      }
    }
  }
  this.$minDirty$ = 512;
  this.$maxDirty$ = -1;
}, $decodeSat$: function $$JSSMS$Vdp$$$$$decodeSat$$() {
  this.$isSatDirty$ = $JSCompiler_alias_FALSE$$;
  for (var $height$$11_i$$22$$ = 0; $height$$11_i$$22$$ < this.$lineSprites$.length; $height$$11_i$$22$$++) {
    this.$lineSprites$[$height$$11_i$$22$$][0] = 0;
  }
  $height$$11_i$$22$$ = 0 == (this.$vdpreg$[1] & 2) ? 8 : 16;
  1 == (this.$vdpreg$[1] & 1) && ($height$$11_i$$22$$ <<= 1);
  for (var $spriteno$$ = 0; 64 > $spriteno$$; $spriteno$$++) {
    var $y$$43$$ = this.$VRAM$[this.$sat$ + $spriteno$$] & 255;
    if (208 == $y$$43$$) {
      break;
    }
    $y$$43$$++;
    240 < $y$$43$$ && ($y$$43$$ -= 256);
    for (var $lineno$$6$$ = 0; 192 > $lineno$$6$$; $lineno$$6$$++) {
      if ($lineno$$6$$ >= $y$$43$$ && $lineno$$6$$ - $y$$43$$ < $height$$11_i$$22$$) {
        var $sprites$$1$$ = this.$lineSprites$[$lineno$$6$$];
        if (8 > $sprites$$1$$[0]) {
          var $off$$1$$ = 3 * $sprites$$1$$[0] + 1, $address$$6$$ = this.$sat$ + ($spriteno$$ << 1) + 128;
          $sprites$$1$$[$off$$1$$++] = this.$VRAM$[$address$$6$$++] & 255;
          $sprites$$1$$[$off$$1$$++] = $y$$43$$;
          $sprites$$1$$[$off$$1$$++] = this.$VRAM$[$address$$6$$] & 255;
          $sprites$$1$$[0]++;
        }
      }
    }
  }
}};
function $JSSMS$DummyUI$$($sms$$4$$) {
  this.$main$ = $sms$$4$$;
  this.enable = $JSCompiler_emptyFn$$();
  this.updateStatus = $JSCompiler_emptyFn$$();
  this.$writeAudio$ = $JSCompiler_emptyFn$$();
  this.$writeFrame$ = $JSCompiler_emptyFn$$();
}
'undefined' !== typeof $ && ($.fn.$JSSMSUI$ = function $$$fn$$JSSMSUI$$($roms$$) {
  function $UI$$($root_sms$$5$$) {
    this.$main$ = $root_sms$$5$$;
    var $self$$2$$ = this, $root_sms$$5$$ = $('<div></div>'), $romContainer$$ = $('<div class="roms"></div>'), $controls$$ = $('<div class="controls"></div>'), $fullscreenSupport$$ = $JSSMS$Utils$getPrefix$$(['fullscreenEnabled', 'mozFullScreenEnabled', 'webkitCancelFullScreen']);
    this.$hiddenPrefix$ = $JSSMS$Utils$getPrefix$$(['hidden', 'mozHidden', 'webkitHidden', 'msHidden']);
    this.screen = $('<canvas width=256 height=192 class="screen"></canvas>');
    this.$canvasContext$ = this.screen[0].getContext('2d');
    this.$canvasContext$.getImageData ? (this.$canvasImageData$ = this.$canvasContext$.getImageData(0, 0, 256, 192), this.$resetCanvas$(), this.$romSelect$ = $('<select></select>').appendTo($romContainer$$), this.$romSelect$.change(function() {
      $self$$2$$.$loadROM$();
      $self$$2$$.$buttons$.start.removeAttr('disabled');
    }), this.$buttons$ = {start: $('<input type="button" value="Stop" class="btn" disabled="disabled">').appendTo($controls$$), $restart$: $('<input type="button" value="Restart" class="btn" disabled="disabled">').appendTo($controls$$), $sound$: $('<input type="button" value="Enable sound" class="btn" disabled="disabled">').appendTo($controls$$), zoom: $('<input type="button" value="Zoom in" class="btn">').appendTo($controls$$)}, $fullscreenSupport$$ && $('<input type="button" value="Go fullscreen" class="btn">').appendTo($controls$$).click(function() {
      var $screen$$1$$ = $self$$2$$.screen[0];
      $screen$$1$$.requestFullscreen ? $screen$$1$$.requestFullscreen() : $screen$$1$$.mozRequestFullScreen ? $screen$$1$$.mozRequestFullScreen() : $screen$$1$$.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
    }), this.log = $('<div id="status"></div>'), this.$buttons$.start.click(function() {
      $self$$2$$.$main$.$isRunning$ ? ($self$$2$$.$main$.stop(), $self$$2$$.updateStatus('Paused'), $self$$2$$.$buttons$.start.attr('value', 'Start')) : ($self$$2$$.$main$.start(), $self$$2$$.$buttons$.start.attr('value', 'Stop'));
    }), this.$buttons$.$restart$.click(function() {
      $self$$2$$.$main$.$reloadRom$() ? ($self$$2$$.$main$.reset(), $self$$2$$.$main$.$vdp$.$forceFullRedraw$(), $self$$2$$.$main$.start()) : $(this).attr('disabled', 'disabled');
    }), this.$buttons$.$sound$.click($JSCompiler_emptyFn$$()), this.$zoomed$ = $JSCompiler_alias_FALSE$$, this.$buttons$.zoom.click(function() {
      $self$$2$$.$zoomed$ ? ($self$$2$$.screen.animate({width: '256px', height: '192px'}, function() {
        $(this).removeAttr('style');
      }), $self$$2$$.$buttons$.zoom.attr('value', 'Zoom in')) : ($self$$2$$.screen.animate({width: '512px', height: '384px'}), $self$$2$$.$buttons$.zoom.attr('value', 'Zoom out'));
      $self$$2$$.$zoomed$ = !$self$$2$$.$zoomed$;
    }), this.screen.appendTo($root_sms$$5$$), $romContainer$$.appendTo($root_sms$$5$$), $controls$$.appendTo($root_sms$$5$$), this.log.appendTo($root_sms$$5$$), $root_sms$$5$$.appendTo($($parent$$2$$)), 'undefined' != typeof $roms$$ && this.$setRoms$($roms$$), $(document).bind('keydown', function($evt$$16$$) {
      $self$$2$$.$main$.$keyboard$.keydown($evt$$16$$);
    }).bind('keyup', function($evt$$17$$) {
      $self$$2$$.$main$.$keyboard$.keyup($evt$$17$$);
    }), $self$$2$$.$sound$ = new $XAudioServer$$(1, 44100, 0, 819200, $JSCompiler_alias_NULL$$, 1)) : $($parent$$2$$).html('<div class="alert-message error"><p><strong>Oh no!</strong> Your browser doesn\'t support writing pixels directly to the <code>&lt;canvas&gt;</code> tag. Try the latest versions of Firefox, Google Chrome, Opera or Safari!</p></div>');
  }
  var $parent$$2$$ = this;
  $UI$$.prototype = {reset: function $$UI$$$$reset$() {
    this.screen[0].width = 256;
    this.screen[0].height = 192;
    this.log.text('');
  }, $resetCanvas$: function $$UI$$$$$resetCanvas$$() {
    this.$canvasContext$.fillStyle = 'black';
    this.$canvasContext$.fillRect(0, 0, 256, 192);
    for (var $i$$23$$ = 3; $i$$23$$ <= this.$canvasImageData$.data.length - 3; $i$$23$$ += 4) {
      this.$canvasImageData$.data[$i$$23$$] = 255;
    }
  }, $setRoms$: function $$UI$$$$$setRoms$$($roms$$1$$) {
    this.$romSelect$.children().remove();
    $('<option>Select a ROM...</option>').appendTo(this.$romSelect$);
    for (var $groupName$$ in $roms$$1$$) {
      if ($roms$$1$$.hasOwnProperty($groupName$$)) {
        for (var $optgroup$$ = $('<optgroup></optgroup>').attr('label', $groupName$$), $i$$24$$ = 0; $i$$24$$ < $roms$$1$$[$groupName$$].length; $i$$24$$++) {
          $('<option>' + $roms$$1$$[$groupName$$][$i$$24$$][0] + '</option>').attr('value', $roms$$1$$[$groupName$$][$i$$24$$][1]).appendTo($optgroup$$);
        }
        this.$romSelect$.append($optgroup$$);
      }
    }
  }, $loadROM$: function $$UI$$$$$loadROM$$() {
    var $self$$3$$ = this;
    this.updateStatus('Downloading...');
    $.ajax({url: escape(this.$romSelect$.val()), xhr: function() {
      var $xhr$$ = $.ajaxSettings.xhr();
      'undefined' !== typeof $xhr$$.overrideMimeType && $xhr$$.overrideMimeType('text/plain; charset=x-user-defined');
      return $self$$3$$.xhr = $xhr$$;
    }, complete: function($xhr$$1$$) {
      $self$$3$$.$main$.$readRomDirectly$($xhr$$1$$.responseText, $self$$3$$.$romSelect$.val());
      $self$$3$$.$main$.reset();
      $self$$3$$.$main$.$vdp$.$forceFullRedraw$();
      $self$$3$$.$main$.start();
      $self$$3$$.enable();
    }});
  }, enable: function $$UI$$$$enable$() {
    this.$buttons$.$restart$.removeAttr('disabled');
    this.$main$.$soundEnabled$ ? this.$buttons$.$sound$.attr('value', 'Disable sound') : this.$buttons$.$sound$.attr('value', 'Enable sound');
  }, updateStatus: function $$UI$$$$updateStatus$($s$$3$$) {
    this.log.text($s$$3$$);
  }, $writeAudio$: function $$UI$$$$$writeAudio$$($buffer$$11$$) {
    var $JSCompiler_StaticMethods_writeAudioNoCallback$self$$inline_16$$ = this.$sound$;
    0 == $JSCompiler_StaticMethods_writeAudioNoCallback$self$$inline_16$$.$audioType$ ? $JSCompiler_StaticMethods_writeMozAudio$$($JSCompiler_StaticMethods_writeAudioNoCallback$self$$inline_16$$, $buffer$$11$$) : 1 == $JSCompiler_StaticMethods_writeAudioNoCallback$self$$inline_16$$.$audioType$ ? $JSCompiler_StaticMethods_callbackBasedWriteAudioNoCallback$$($buffer$$11$$) : 2 == $JSCompiler_StaticMethods_writeAudioNoCallback$self$$inline_16$$.$audioType$ && ($JSCompiler_StaticMethods_checkFlashInit$$($JSCompiler_StaticMethods_writeAudioNoCallback$self$$inline_16$$) ||
        $launchedContext$$ ? $JSCompiler_StaticMethods_callbackBasedWriteAudioNoCallback$$($buffer$$11$$) : $JSCompiler_StaticMethods_writeAudioNoCallback$self$$inline_16$$.$mozAudioFound$ && $JSCompiler_StaticMethods_writeMozAudio$$($JSCompiler_StaticMethods_writeAudioNoCallback$self$$inline_16$$, $buffer$$11$$))
  }, $writeFrame$: function $$UI$$$$$writeFrame$$($buffer$$12$$) {
    if (!this.$hiddenPrefix$ || !document[this.$hiddenPrefix$]) {
      var $imageData$$ = this.$canvasImageData$.data, $pixel$$, $i$$26$$, $j$$2$$;
      for ($i$$26$$ = 0; 49152 >= $i$$26$$; $i$$26$$++) {
        $pixel$$ = $buffer$$12$$[$i$$26$$], $j$$2$$ = 4 * $i$$26$$, $imageData$$[$j$$2$$] = $pixel$$ & 255, $imageData$$[$j$$2$$ + 1] = $pixel$$ >> 8 & 255, $imageData$$[$j$$2$$ + 2] = $pixel$$ >> 16 & 255;
      }
      this.$canvasContext$.putImageData(this.$canvasImageData$, 0, 0);
    }
  }};
  return $UI$$;
});
function $JSSMS$Ports$$($sms$$6$$) {
  this.$main$ = $sms$$6$$;
  this.$vdp$ = $sms$$6$$.$vdp$;
  this.$psg$ = $sms$$6$$.$psg$;
  this.$keyboard$ = $sms$$6$$.$keyboard$;
  this.$europe$ = 64;
  this.$hCounter$ = 0;
  this.$ioPorts$ = [];
}
$JSSMS$Ports$$.prototype = {reset: function $$JSSMS$Ports$$$$reset$() {
  this.$ioPorts$ = Array(2);
}, $out$: function $$JSSMS$Ports$$$$$out$$($port$$, $value$$83$$) {
  if (!(this.$main$.$is_gg$ && 7 > $port$$)) {
    switch ($port$$ & 193) {
      case 1:
        this.$ioPorts$[0] = ($value$$83$$ & 32) << 1;
        this.$ioPorts$[1] = $value$$83$$ & 128;
        0 == this.$europe$ && (this.$ioPorts$[0] = ~this.$ioPorts$[0], this.$ioPorts$[1] = ~this.$ioPorts$[1]);
        break;
      case 128:
        this.$vdp$.$dataWrite$($value$$83$$);
        break;
      case 129:
        this.$vdp$.$controlWrite$($value$$83$$);
        break;
      case 64:
;
      case 65:
        this.$main$.$soundEnabled$ && this.$psg$.write($value$$83$$);
    }
  }
}, $in_$: function $$JSSMS$Ports$$$$$in_$$($port$$1$$) {
  if (this.$main$.$is_gg$ && 7 > $port$$1$$) {
    switch ($port$$1$$) {
      case 0:
        return this.$keyboard$.$ggstart$ & 191 | this.$europe$;
      case 1:
;
      case 2:
;
      case 3:
;
      case 4:
;
      case 5:
        return 0;
      case 6:
        return 255;
    }
  }
  switch ($port$$1$$ & 193) {
    case 64:
      return this.$vdp$.$getVCount$();
    case 65:
      return this.$hCounter$;
    case 128:
      return this.$vdp$.$dataRead$();
    case 129:
      return this.$vdp$.$controlRead$();
    case 192:
      return this.$keyboard$.$controller1$;
    case 193:
      return this.$keyboard$.$controller2$ & 63 | this.$ioPorts$[0] | this.$ioPorts$[1];
  }
  return 255;
}};
var $swfobject$$ = function() {
  function $callDomLoadFunctions$$() {
    if (!$isDomLoaded$$) {
      try {
        var $dl_t$$ = $doc$$.getElementsByTagName('body')[0].appendChild($doc$$.createElement('span'));
        $dl_t$$.parentNode.removeChild($dl_t$$);
      }catch ($e$$8$$) {
        return;
      }
      $isDomLoaded$$ = $JSCompiler_alias_TRUE$$;
      for (var $dl_t$$ = $domLoadFnArr$$.length, $i$$27$$ = 0; $i$$27$$ < $dl_t$$; $i$$27$$++) {
        $domLoadFnArr$$[$i$$27$$]();
      }
    }
  }
  function $addDomLoadEvent$$($fn$$) {
    $isDomLoaded$$ ? $fn$$() : $domLoadFnArr$$[$domLoadFnArr$$.length] = $fn$$;
  }
  function $addLoadEvent$$($fn$$1$$) {
    if (typeof $win$$.addEventListener != $UNDEF$$) {
      $win$$.addEventListener('load', $fn$$1$$, $JSCompiler_alias_FALSE$$);
    }else {
      if (typeof $doc$$.addEventListener != $UNDEF$$) {
        $doc$$.addEventListener('load', $fn$$1$$, $JSCompiler_alias_FALSE$$);
      }else {
        if (typeof $win$$.attachEvent != $UNDEF$$) {
          $addListener$$($win$$, $fn$$1$$);
        }else {
          if ('function' == typeof $win$$.onload) {
            var $fnOld$$ = $win$$.onload;
            $win$$.onload = function $$win$$$onload$() {
              $fnOld$$();
              $fn$$1$$();
            }
          }else {
            $win$$.onload = $fn$$1$$;
          }
        }
      }
    }
  }
  function $testPlayerVersion$$() {
    var $b$$2$$ = $doc$$.getElementsByTagName('body')[0], $o$$ = $doc$$.createElement($OBJECT$$);
    $o$$.setAttribute('type', $FLASH_MIME_TYPE$$);
    var $t$$1$$ = $b$$2$$.appendChild($o$$);
    if ($t$$1$$) {
      var $counter$$1$$ = 0;
      (function() {
        if (typeof $t$$1$$.GetVariable != $UNDEF$$) {
          var $d$$1$$ = $t$$1$$.GetVariable('$version');
          $d$$1$$ && ($d$$1$$ = $d$$1$$.split(' ')[1].split(','), $ua$$.$pv$ = [parseInt($d$$1$$[0], 10), parseInt($d$$1$$[1], 10), parseInt($d$$1$$[2], 10)]);
        }else {
          if (10 > $counter$$1$$) {
            $counter$$1$$++;
            setTimeout(arguments.callee, 10);
            return;
          }
        }
        $b$$2$$.removeChild($o$$);
        $t$$1$$ = $JSCompiler_alias_NULL$$;
        $matchVersions$$();
      })();
    }else {
      $matchVersions$$();
    }
  }
  function $matchVersions$$() {
    var $rl$$ = $regObjArr$$.length;
    if (0 < $rl$$) {
      for (var $i$$28$$ = 0; $i$$28$$ < $rl$$; $i$$28$$++) {
        var $id$$1_o$$1$$ = $regObjArr$$[$i$$28$$].id, $cb$$ = $regObjArr$$[$i$$28$$].$callbackFn$, $att_cbObj$$ = {success: $JSCompiler_alias_FALSE$$, id: $id$$1_o$$1$$};
        if (0 < $ua$$.$pv$[0]) {
          var $obj$$32_p$$2$$ = $getElementById$$($id$$1_o$$1$$);
          if ($obj$$32_p$$2$$) {
            if ($hasPlayerVersion$$($regObjArr$$[$i$$28$$].$swfVersion$) && !($ua$$.$wk$ && 312 > $ua$$.$wk$)) {
              $setVisibility$$($id$$1_o$$1$$, $JSCompiler_alias_TRUE$$), $cb$$ && ($att_cbObj$$.success = $JSCompiler_alias_TRUE$$, $att_cbObj$$.$ref$ = $getObjectById$$($id$$1_o$$1$$), $cb$$($att_cbObj$$));
            }else {
              if ($regObjArr$$[$i$$28$$].$expressInstall$ && $canExpressInstall$$()) {
                $att_cbObj$$ = {};
                $att_cbObj$$.data = $regObjArr$$[$i$$28$$].$expressInstall$;
                $att_cbObj$$.width = $obj$$32_p$$2$$.getAttribute('width') || '0';
                $att_cbObj$$.height = $obj$$32_p$$2$$.getAttribute('height') || '0';
                $obj$$32_p$$2$$.getAttribute('class') && ($att_cbObj$$.$styleclass$ = $obj$$32_p$$2$$.getAttribute('class'));
                $obj$$32_p$$2$$.getAttribute('align') && ($att_cbObj$$.align = $obj$$32_p$$2$$.getAttribute('align'));
                for (var $par$$ = {}, $obj$$32_p$$2$$ = $obj$$32_p$$2$$.getElementsByTagName('param'), $pl$$ = $obj$$32_p$$2$$.length, $j$$3$$ = 0; $j$$3$$ < $pl$$; $j$$3$$++) {
                  'movie' != $obj$$32_p$$2$$[$j$$3$$].getAttribute('name').toLowerCase() && ($par$$[$obj$$32_p$$2$$[$j$$3$$].getAttribute('name')] = $obj$$32_p$$2$$[$j$$3$$].getAttribute('value'));
                }
                $showExpressInstall$$($att_cbObj$$, $par$$, $id$$1_o$$1$$, $cb$$);
              }else {
                $displayAltContent$$($obj$$32_p$$2$$), $cb$$ && $cb$$($att_cbObj$$);
              }
            }
          }
        }else {
          if ($setVisibility$$($id$$1_o$$1$$, $JSCompiler_alias_TRUE$$), $cb$$) {
            if (($id$$1_o$$1$$ = $getObjectById$$($id$$1_o$$1$$)) && typeof $id$$1_o$$1$$.SetVariable != $UNDEF$$) {
              $att_cbObj$$.success = $JSCompiler_alias_TRUE$$, $att_cbObj$$.$ref$ = $id$$1_o$$1$$;
            }
            $cb$$($att_cbObj$$);
          }
        }
      }
    }
  }
  function $getObjectById$$($n$$3_o$$2_objectIdStr$$) {
    var $r$$1$$ = $JSCompiler_alias_NULL$$;
    if (($n$$3_o$$2_objectIdStr$$ = $getElementById$$($n$$3_o$$2_objectIdStr$$)) && 'OBJECT' == $n$$3_o$$2_objectIdStr$$.nodeName) {
      typeof $n$$3_o$$2_objectIdStr$$.SetVariable != $UNDEF$$ ? $r$$1$$ = $n$$3_o$$2_objectIdStr$$ : ($n$$3_o$$2_objectIdStr$$ = $n$$3_o$$2_objectIdStr$$.getElementsByTagName($OBJECT$$)[0]) && ($r$$1$$ = $n$$3_o$$2_objectIdStr$$);
    }
    return $r$$1$$;
  }
  function $canExpressInstall$$() {
    return!$isExpressInstallActive$$ && $hasPlayerVersion$$('6.0.65') && ($ua$$.$win$ || $ua$$.$mac$) && !($ua$$.$wk$ && 312 > $ua$$.$wk$);
  }
  function $showExpressInstall$$($att$$1$$, $par$$1$$, $replaceElemIdStr$$, $callbackFn_fv_newObj_pt$$) {
    $isExpressInstallActive$$ = $JSCompiler_alias_TRUE$$;
    $storedCallbackFn$$ = $callbackFn_fv_newObj_pt$$ || $JSCompiler_alias_NULL$$;
    $storedCallbackObj$$ = {success: $JSCompiler_alias_FALSE$$, id: $replaceElemIdStr$$};
    var $obj$$33$$ = $getElementById$$($replaceElemIdStr$$);
    if ($obj$$33$$) {
      'OBJECT' == $obj$$33$$.nodeName ? ($storedAltContent$$ = $abstractAltContent$$($obj$$33$$), $storedAltContentId$$ = $JSCompiler_alias_NULL$$) : ($storedAltContent$$ = $obj$$33$$, $storedAltContentId$$ = $replaceElemIdStr$$);
      $att$$1$$.id = $EXPRESS_INSTALL_ID$$;
      if (typeof $att$$1$$.width == $UNDEF$$ || !/%$/.test($att$$1$$.width) && 310 > parseInt($att$$1$$.width, 10)) {
        $att$$1$$.width = '310';
      }
      if (typeof $att$$1$$.height == $UNDEF$$ || !/%$/.test($att$$1$$.height) && 137 > parseInt($att$$1$$.height, 10)) {
        $att$$1$$.height = '137';
      }
      $doc$$.title = $doc$$.title.slice(0, 47) + ' - Flash Player Installation';
      $callbackFn_fv_newObj_pt$$ = $ua$$.$ie$ && $ua$$.$win$ ? 'ActiveX' : 'PlugIn';
      $callbackFn_fv_newObj_pt$$ = 'MMredirectURL=' + ('' + $win$$.location).replace(/&/g, '%26') + '&MMplayerType=' + $callbackFn_fv_newObj_pt$$ + '&MMdoctitle=' + $doc$$.title;
      $par$$1$$.$flashvars$ = typeof $par$$1$$.$flashvars$ != $UNDEF$$ ? $par$$1$$.$flashvars$ + ('&' + $callbackFn_fv_newObj_pt$$) : $callbackFn_fv_newObj_pt$$;
      $ua$$.$ie$ && ($ua$$.$win$ && 4 != $obj$$33$$.readyState) && ($callbackFn_fv_newObj_pt$$ = $doc$$.createElement('div'), $replaceElemIdStr$$ += 'SWFObjectNew', $callbackFn_fv_newObj_pt$$.setAttribute('id', $replaceElemIdStr$$), $obj$$33$$.parentNode.insertBefore($callbackFn_fv_newObj_pt$$, $obj$$33$$), $obj$$33$$.style.display = 'none', function() {
        $obj$$33$$.readyState == 4 ? $obj$$33$$.parentNode.removeChild($obj$$33$$) : setTimeout(arguments.callee, 10);
      }());
      $createSWF$$($att$$1$$, $par$$1$$, $replaceElemIdStr$$);
    }
  }
  function $displayAltContent$$($obj$$34$$) {
    if ($ua$$.$ie$ && $ua$$.$win$ && 4 != $obj$$34$$.readyState) {
      var $el$$1$$ = $doc$$.createElement('div');
      $obj$$34$$.parentNode.insertBefore($el$$1$$, $obj$$34$$);
      $el$$1$$.parentNode.replaceChild($abstractAltContent$$($obj$$34$$), $el$$1$$);
      $obj$$34$$.style.display = 'none';
      (function() {
        4 == $obj$$34$$.readyState ? $obj$$34$$.parentNode.removeChild($obj$$34$$) : setTimeout(arguments.callee, 10);
      })();
    }else {
      $obj$$34$$.parentNode.replaceChild($abstractAltContent$$($obj$$34$$), $obj$$34$$);
    }
  }
  function $abstractAltContent$$($c$$1_nestedObj_obj$$35$$) {
    var $ac$$ = $doc$$.createElement('div');
    if ($ua$$.$win$ && $ua$$.$ie$) {
      $ac$$.innerHTML = $c$$1_nestedObj_obj$$35$$.innerHTML;
    }else {
      if ($c$$1_nestedObj_obj$$35$$ = $c$$1_nestedObj_obj$$35$$.getElementsByTagName($OBJECT$$)[0]) {
        if ($c$$1_nestedObj_obj$$35$$ = $c$$1_nestedObj_obj$$35$$.childNodes) {
          for (var $cl$$ = $c$$1_nestedObj_obj$$35$$.length, $i$$29$$ = 0; $i$$29$$ < $cl$$; $i$$29$$++) {
            !(1 == $c$$1_nestedObj_obj$$35$$[$i$$29$$].nodeType && 'PARAM' == $c$$1_nestedObj_obj$$35$$[$i$$29$$].nodeName) && 8 != $c$$1_nestedObj_obj$$35$$[$i$$29$$].nodeType && $ac$$.appendChild($c$$1_nestedObj_obj$$35$$[$i$$29$$].cloneNode($JSCompiler_alias_TRUE$$));
          }
        }
      }
    }
    return $ac$$;
  }
  function $createSWF$$($attObj_el$$inline_19$$, $parObj$$, $id$$2_p$$inline_22$$) {
    var $r$$2$$, $el$$2$$ = $getElementById$$($id$$2_p$$inline_22$$);
    if ($ua$$.$wk$ && 312 > $ua$$.$wk$) {
      return $r$$2$$;
    }
    if ($el$$2$$) {
      if (typeof $attObj_el$$inline_19$$.id == $UNDEF$$ && ($attObj_el$$inline_19$$.id = $id$$2_p$$inline_22$$), $ua$$.$ie$ && $ua$$.$win$) {
        var $att$$2_n$$4$$ = '', $i$$30_pName$$inline_20_par$$2$$;
        for ($i$$30_pName$$inline_20_par$$2$$ in $attObj_el$$inline_19$$) {
          $attObj_el$$inline_19$$[$i$$30_pName$$inline_20_par$$2$$] != Object.prototype[$i$$30_pName$$inline_20_par$$2$$] && ('data' == $i$$30_pName$$inline_20_par$$2$$.toLowerCase() ? $parObj$$.$movie$ = $attObj_el$$inline_19$$[$i$$30_pName$$inline_20_par$$2$$] : 'styleclass' == $i$$30_pName$$inline_20_par$$2$$.toLowerCase() ? $att$$2_n$$4$$ += ' class="' + $attObj_el$$inline_19$$[$i$$30_pName$$inline_20_par$$2$$] + '"' : 'classid' != $i$$30_pName$$inline_20_par$$2$$.toLowerCase() && ($att$$2_n$$4$$ +=
              ' ' + $i$$30_pName$$inline_20_par$$2$$ + '="' + $attObj_el$$inline_19$$[$i$$30_pName$$inline_20_par$$2$$] + '"'));
        }
        $i$$30_pName$$inline_20_par$$2$$ = '';
        for (var $j$$4_o$$3$$ in $parObj$$) {
          $parObj$$[$j$$4_o$$3$$] != Object.prototype[$j$$4_o$$3$$] && ($i$$30_pName$$inline_20_par$$2$$ += '<param name="' + $j$$4_o$$3$$ + '" value="' + $parObj$$[$j$$4_o$$3$$] + '" />');
        }
        $el$$2$$.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + $att$$2_n$$4$$ + '>' + $i$$30_pName$$inline_20_par$$2$$ + '</object>';
        $objIdArr$$[$objIdArr$$.length] = $attObj_el$$inline_19$$.id;
        $r$$2$$ = $getElementById$$($attObj_el$$inline_19$$.id);
      }else {
        $j$$4_o$$3$$ = $doc$$.createElement($OBJECT$$);
        $j$$4_o$$3$$.setAttribute('type', $FLASH_MIME_TYPE$$);
        for (var $m_pValue$$inline_21$$ in $attObj_el$$inline_19$$) {
          $attObj_el$$inline_19$$[$m_pValue$$inline_21$$] != Object.prototype[$m_pValue$$inline_21$$] && ('styleclass' == $m_pValue$$inline_21$$.toLowerCase() ? $j$$4_o$$3$$.setAttribute('class', $attObj_el$$inline_19$$[$m_pValue$$inline_21$$]) : 'classid' != $m_pValue$$inline_21$$.toLowerCase() && $j$$4_o$$3$$.setAttribute($m_pValue$$inline_21$$, $attObj_el$$inline_19$$[$m_pValue$$inline_21$$]));
        }
        for ($att$$2_n$$4$$ in $parObj$$) {
          $parObj$$[$att$$2_n$$4$$] != Object.prototype[$att$$2_n$$4$$] && 'movie' != $att$$2_n$$4$$.toLowerCase() && ($attObj_el$$inline_19$$ = $j$$4_o$$3$$, $i$$30_pName$$inline_20_par$$2$$ = $att$$2_n$$4$$, $m_pValue$$inline_21$$ = $parObj$$[$att$$2_n$$4$$], $id$$2_p$$inline_22$$ = $doc$$.createElement('param'), $id$$2_p$$inline_22$$.setAttribute('name', $i$$30_pName$$inline_20_par$$2$$), $id$$2_p$$inline_22$$.setAttribute('value', $m_pValue$$inline_21$$), $attObj_el$$inline_19$$.appendChild($id$$2_p$$inline_22$$));
        }
        $el$$2$$.parentNode.replaceChild($j$$4_o$$3$$, $el$$2$$);
        $r$$2$$ = $j$$4_o$$3$$;
      }
    }
    return $r$$2$$;
  }
  function $removeSWF$$($id$$3$$) {
    var $obj$$36$$ = $getElementById$$($id$$3$$);
    $obj$$36$$ && 'OBJECT' == $obj$$36$$.nodeName && ($ua$$.$ie$ && $ua$$.$win$ ? ($obj$$36$$.style.display = 'none', function() {
      if (4 == $obj$$36$$.readyState) {
        var $obj$$inline_25$$ = $getElementById$$($id$$3$$);
        if ($obj$$inline_25$$) {
          for (var $i$$inline_26$$ in $obj$$inline_25$$) {
            'function' == typeof $obj$$inline_25$$[$i$$inline_26$$] && ($obj$$inline_25$$[$i$$inline_26$$] = $JSCompiler_alias_NULL$$);
          }
          $obj$$inline_25$$.parentNode.removeChild($obj$$inline_25$$);
        }
      }else {
        setTimeout(arguments.callee, 10);
      }
    }()) : $obj$$36$$.parentNode.removeChild($obj$$36$$));
  }
  function $getElementById$$($id$$5$$) {
    var $el$$4$$ = $JSCompiler_alias_NULL$$;
    try {
      $el$$4$$ = $doc$$.getElementById($id$$5$$);
    }catch ($e$$9$$) {
    }
    return $el$$4$$;
  }
  function $addListener$$($target$$45$$, $fn$$2$$) {
    $target$$45$$.attachEvent('onload', $fn$$2$$);
    $listenersArr$$[$listenersArr$$.length] = [$target$$45$$, 'onload', $fn$$2$$];
  }
  function $hasPlayerVersion$$($rv_v$$2$$) {
    var $pv$$ = $ua$$.$pv$, $rv_v$$2$$ = $rv_v$$2$$.split('.');
    $rv_v$$2$$[0] = parseInt($rv_v$$2$$[0], 10);
    $rv_v$$2$$[1] = parseInt($rv_v$$2$$[1], 10) || 0;
    $rv_v$$2$$[2] = parseInt($rv_v$$2$$[2], 10) || 0;
    return $pv$$[0] > $rv_v$$2$$[0] || $pv$$[0] == $rv_v$$2$$[0] && $pv$$[1] > $rv_v$$2$$[1] || $pv$$[0] == $rv_v$$2$$[0] && $pv$$[1] == $rv_v$$2$$[1] && $pv$$[2] >= $rv_v$$2$$[2] ? $JSCompiler_alias_TRUE$$ : $JSCompiler_alias_FALSE$$;
  }
  function $createCSS$$($sel$$, $decl$$, $m$$1_media$$1$$, $newStyle_s$$4$$) {
    if (!$ua$$.$ie$ || !$ua$$.$mac$) {
      var $h$$5$$ = $doc$$.getElementsByTagName('head')[0];
      if ($h$$5$$) {
        $m$$1_media$$1$$ = $m$$1_media$$1$$ && 'string' == typeof $m$$1_media$$1$$ ? $m$$1_media$$1$$ : 'screen';
        $newStyle_s$$4$$ && ($dynamicStylesheetMedia$$ = $dynamicStylesheet$$ = $JSCompiler_alias_NULL$$);
        if (!$dynamicStylesheet$$ || $dynamicStylesheetMedia$$ != $m$$1_media$$1$$) {
          $newStyle_s$$4$$ = $doc$$.createElement('style'), $newStyle_s$$4$$.setAttribute('type', 'text/css'), $newStyle_s$$4$$.setAttribute('media', $m$$1_media$$1$$), $dynamicStylesheet$$ = $h$$5$$.appendChild($newStyle_s$$4$$), $ua$$.$ie$ && ($ua$$.$win$ && typeof $doc$$.styleSheets != $UNDEF$$ && 0 < $doc$$.styleSheets.length) && ($dynamicStylesheet$$ = $doc$$.styleSheets[$doc$$.styleSheets.length - 1]), $dynamicStylesheetMedia$$ = $m$$1_media$$1$$;
        }
        $ua$$.$ie$ && $ua$$.$win$ ? $dynamicStylesheet$$ && typeof $dynamicStylesheet$$.addRule == $OBJECT$$ && $dynamicStylesheet$$.addRule($sel$$, $decl$$) : $dynamicStylesheet$$ && typeof $doc$$.createTextNode != $UNDEF$$ && $dynamicStylesheet$$.appendChild($doc$$.createTextNode($sel$$ + ' {' + $decl$$ + '}'));
      }
    }
  }
  function $setVisibility$$($id$$6$$, $isVisible$$) {
    if ($autoHideShow$$) {
      var $v$$3$$ = $isVisible$$ ? 'visible' : 'hidden';
      $isDomLoaded$$ && $getElementById$$($id$$6$$) ? $getElementById$$($id$$6$$).style.visibility = $v$$3$$ : $createCSS$$('#' + $id$$6$$, 'visibility:' + $v$$3$$);
    }
  }
  function $urlEncodeIfNecessary$$($s$$5$$) {
    return/[\\\"<>\.;]/.exec($s$$5$$) != $JSCompiler_alias_NULL$$ && typeof encodeURIComponent != $UNDEF$$ ? encodeURIComponent($s$$5$$) : $s$$5$$;
  }
  var $UNDEF$$ = 'undefined', $OBJECT$$ = 'object', $FLASH_MIME_TYPE$$ = 'application/x-shockwave-flash', $EXPRESS_INSTALL_ID$$ = 'SWFObjectExprInst', $win$$ = window, $doc$$ = document, $nav$$ = navigator, $plugin$$ = $JSCompiler_alias_FALSE$$, $domLoadFnArr$$ = [function main() {
    $plugin$$ ? $testPlayerVersion$$() : $matchVersions$$();
  }], $regObjArr$$ = [], $objIdArr$$ = [], $listenersArr$$ = [], $storedAltContent$$, $storedAltContentId$$, $storedCallbackFn$$, $storedCallbackObj$$, $isDomLoaded$$ = $JSCompiler_alias_FALSE$$, $isExpressInstallActive$$ = $JSCompiler_alias_FALSE$$, $dynamicStylesheet$$, $dynamicStylesheetMedia$$, $autoHideShow$$ = $JSCompiler_alias_TRUE$$, $ua$$ = function() {
    var $w3cdom$$ = typeof $doc$$.getElementById != $UNDEF$$ && typeof $doc$$.getElementsByTagName != $UNDEF$$ && typeof $doc$$.createElement != $UNDEF$$, $u_webkit$$ = $nav$$.userAgent.toLowerCase(), $mac_p$$4$$ = $nav$$.platform.toLowerCase(), $windows$$ = $mac_p$$4$$ ? /win/.test($mac_p$$4$$) : /win/.test($u_webkit$$), $mac_p$$4$$ = $mac_p$$4$$ ? /mac/.test($mac_p$$4$$) : /mac/.test($u_webkit$$), $u_webkit$$ = /webkit/.test($u_webkit$$) ? parseFloat($u_webkit$$.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,
        '$1')) : $JSCompiler_alias_FALSE$$, $ie$$ = !+'\v1', $playerVersion$$ = [0, 0, 0], $d$$2$$ = $JSCompiler_alias_NULL$$;
    if (typeof $nav$$.plugins != $UNDEF$$ && typeof $nav$$.plugins['Shockwave Flash'] == $OBJECT$$) {
      if (($d$$2$$ = $nav$$.plugins['Shockwave Flash'].description) && !(typeof $nav$$.mimeTypes != $UNDEF$$ && $nav$$.mimeTypes[$FLASH_MIME_TYPE$$] && !$nav$$.mimeTypes[$FLASH_MIME_TYPE$$].enabledPlugin)) {
        $plugin$$ = $JSCompiler_alias_TRUE$$, $ie$$ = $JSCompiler_alias_FALSE$$, $d$$2$$ = $d$$2$$.replace(/^.*\s+(\S+\s+\S+$)/, '$1'), $playerVersion$$[0] = parseInt($d$$2$$.replace(/^(.*)\..*$/, '$1'), 10), $playerVersion$$[1] = parseInt($d$$2$$.replace(/^.*\.(.*)\s.*$/, '$1'), 10), $playerVersion$$[2] = /[a-zA-Z]/.test($d$$2$$) ? parseInt($d$$2$$.replace(/^.*[a-zA-Z]+(.*)$/, '$1'), 10) : 0;
      }
    }else {
      if (typeof $win$$.ActiveXObject != $UNDEF$$) {
        try {
          var $a$$1$$ = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
          if ($a$$1$$ && ($d$$2$$ = $a$$1$$.GetVariable('$version'))) {
            $ie$$ = $JSCompiler_alias_TRUE$$, $d$$2$$ = $d$$2$$.split(' ')[1].split(','), $playerVersion$$ = [parseInt($d$$2$$[0], 10), parseInt($d$$2$$[1], 10), parseInt($d$$2$$[2], 10)];
          }
        }catch ($e$$10$$) {
        }
      }
    }
    return{$w3$: $w3cdom$$, $pv$: $playerVersion$$, $wk$: $u_webkit$$, $ie$: $ie$$, $win$: $windows$$, $mac$: $mac_p$$4$$};
  }();
  (function() {
    $ua$$.$w3$ && ((typeof $doc$$.readyState != $UNDEF$$ && 'complete' == $doc$$.readyState || typeof $doc$$.readyState == $UNDEF$$ && ($doc$$.getElementsByTagName('body')[0] || $doc$$.body)) && $callDomLoadFunctions$$(), $isDomLoaded$$ || (typeof $doc$$.addEventListener != $UNDEF$$ && $doc$$.addEventListener('DOMContentLoaded', $callDomLoadFunctions$$, $JSCompiler_alias_FALSE$$), $ua$$.$ie$ && $ua$$.$win$ && ($doc$$.attachEvent('onreadystatechange', function() {
      'complete' == $doc$$.readyState && ($doc$$.detachEvent('onreadystatechange', arguments.callee), $callDomLoadFunctions$$());
    }), $win$$ == top && function() {
      if (!$isDomLoaded$$) {
        try {
          $doc$$.documentElement.doScroll('left');
        }catch ($e$$11$$) {
          setTimeout(arguments.callee, 0);
          return;
        }
        $callDomLoadFunctions$$();
      }
    }()), $ua$$.$wk$ && function() {
      $isDomLoaded$$ || (/loaded|complete/.test($doc$$.readyState) ? $callDomLoadFunctions$$() : setTimeout(arguments.callee, 0));
    }(), $addLoadEvent$$($callDomLoadFunctions$$)));
  })();
  (function() {
    $ua$$.$ie$ && $ua$$.$win$ && window.attachEvent('onunload', function() {
      for (var $il_ll$$ = $listenersArr$$.length, $i$$32_j$$5$$ = 0; $i$$32_j$$5$$ < $il_ll$$; $i$$32_j$$5$$++) {
        $listenersArr$$[$i$$32_j$$5$$][0].detachEvent($listenersArr$$[$i$$32_j$$5$$][1], $listenersArr$$[$i$$32_j$$5$$][2]);
      }
      $il_ll$$ = $objIdArr$$.length;
      for ($i$$32_j$$5$$ = 0; $i$$32_j$$5$$ < $il_ll$$; $i$$32_j$$5$$++) {
        $removeSWF$$($objIdArr$$[$i$$32_j$$5$$]);
      }
      for (var $k$$ in $ua$$) {
        $ua$$[$k$$] = $JSCompiler_alias_NULL$$;
      }
      $ua$$ = $JSCompiler_alias_NULL$$;
      for (var $l$$2$$ in $swfobject$$) {
        $swfobject$$[$l$$2$$] = $JSCompiler_alias_NULL$$;
      }
      $swfobject$$ = $JSCompiler_alias_NULL$$;
    });
  })();
  return{$registerObject$: function($objectIdStr$$1$$, $swfVersionStr$$, $xiSwfUrlStr$$, $callbackFn$$1$$) {
    if ($ua$$.$w3$ && $objectIdStr$$1$$ && $swfVersionStr$$) {
      var $regObj$$ = {};
      $regObj$$.id = $objectIdStr$$1$$;
      $regObj$$.$swfVersion$ = $swfVersionStr$$;
      $regObj$$.$expressInstall$ = $xiSwfUrlStr$$;
      $regObj$$.$callbackFn$ = $callbackFn$$1$$;
      $regObjArr$$[$regObjArr$$.length] = $regObj$$;
      $setVisibility$$($objectIdStr$$1$$, $JSCompiler_alias_FALSE$$);
    }else {
      $callbackFn$$1$$ && $callbackFn$$1$$({success: $JSCompiler_alias_FALSE$$, id: $objectIdStr$$1$$});
    }
  }, $getObjectById$: function($objectIdStr$$2$$) {
    if ($ua$$.$w3$) {
      return $getObjectById$$($objectIdStr$$2$$);
    }
  }, $embedSWF$: function($swfUrlStr$$, $replaceElemIdStr$$1$$, $widthStr$$, $heightStr$$, $swfVersionStr$$1$$, $xiSwfUrlStr$$1$$, $flashvarsObj$$, $parObj$$1$$, $attObj$$1$$, $callbackFn$$2$$) {
    var $callbackObj$$ = {success: $JSCompiler_alias_FALSE$$, id: $replaceElemIdStr$$1$$};
    $ua$$.$w3$ && !($ua$$.$wk$ && 312 > $ua$$.$wk$) && $swfUrlStr$$ && $replaceElemIdStr$$1$$ && $widthStr$$ && $heightStr$$ && $swfVersionStr$$1$$ ? ($setVisibility$$($replaceElemIdStr$$1$$, $JSCompiler_alias_FALSE$$), $addDomLoadEvent$$(function() {
      $widthStr$$ += '';
      $heightStr$$ += '';
      var $att$$3$$ = {};
      if ($attObj$$1$$ && typeof $attObj$$1$$ === $OBJECT$$) {
        for (var $i$$33_par$$3$$ in $attObj$$1$$) {
          $att$$3$$[$i$$33_par$$3$$] = $attObj$$1$$[$i$$33_par$$3$$];
        }
      }
      $att$$3$$.data = $swfUrlStr$$;
      $att$$3$$.width = $widthStr$$;
      $att$$3$$.height = $heightStr$$;
      $i$$33_par$$3$$ = {};
      if ($parObj$$1$$ && typeof $parObj$$1$$ === $OBJECT$$) {
        for (var $j$$6_obj$$38$$ in $parObj$$1$$) {
          $i$$33_par$$3$$[$j$$6_obj$$38$$] = $parObj$$1$$[$j$$6_obj$$38$$];
        }
      }
      if ($flashvarsObj$$ && typeof $flashvarsObj$$ === $OBJECT$$) {
        for (var $k$$1$$ in $flashvarsObj$$) {
          $i$$33_par$$3$$.$flashvars$ = typeof $i$$33_par$$3$$.$flashvars$ != $UNDEF$$ ? $i$$33_par$$3$$.$flashvars$ + ('&' + $k$$1$$ + '=' + $flashvarsObj$$[$k$$1$$]) : $k$$1$$ + '=' + $flashvarsObj$$[$k$$1$$];
        }
      }
      if ($hasPlayerVersion$$($swfVersionStr$$1$$)) {
        $j$$6_obj$$38$$ = $createSWF$$($att$$3$$, $i$$33_par$$3$$, $replaceElemIdStr$$1$$), $att$$3$$.id == $replaceElemIdStr$$1$$ && $setVisibility$$($replaceElemIdStr$$1$$, $JSCompiler_alias_TRUE$$), $callbackObj$$.success = $JSCompiler_alias_TRUE$$, $callbackObj$$.$ref$ = $j$$6_obj$$38$$;
      }else {
        if ($xiSwfUrlStr$$1$$ && $canExpressInstall$$()) {
          $att$$3$$.data = $xiSwfUrlStr$$1$$;
          $showExpressInstall$$($att$$3$$, $i$$33_par$$3$$, $replaceElemIdStr$$1$$, $callbackFn$$2$$);
          return;
        }
        $setVisibility$$($replaceElemIdStr$$1$$, $JSCompiler_alias_TRUE$$);
      }
      $callbackFn$$2$$ && $callbackFn$$2$$($callbackObj$$);
    })) : $callbackFn$$2$$ && $callbackFn$$2$$($callbackObj$$);
  }, $switchOffAutoHideShow$: function() {
    $autoHideShow$$ = $JSCompiler_alias_FALSE$$;
  }, $ua$: $ua$$, $getFlashPlayerVersion$: function() {
    return{$major$: $ua$$.$pv$[0], $minor$: $ua$$.$pv$[1], release: $ua$$.$pv$[2]};
  }, $hasFlashPlayerVersion$: $hasPlayerVersion$$, $createSWF$: function($attObj$$2$$, $parObj$$2$$, $replaceElemIdStr$$2$$) {
    if ($ua$$.$w3$) {
      return $createSWF$$($attObj$$2$$, $parObj$$2$$, $replaceElemIdStr$$2$$);
    }
  }, $showExpressInstall$: function($att$$4$$, $par$$4$$, $replaceElemIdStr$$3$$, $callbackFn$$3$$) {
    $ua$$.$w3$ && $canExpressInstall$$() && $showExpressInstall$$($att$$4$$, $par$$4$$, $replaceElemIdStr$$3$$, $callbackFn$$3$$);
  }, $removeSWF$: function($objElemIdStr$$) {
    $ua$$.$w3$ && $removeSWF$$($objElemIdStr$$);
  }, $createCSS$: function($selStr$$, $declStr$$, $mediaStr$$, $newStyleBoolean$$) {
    $ua$$.$w3$ && $createCSS$$($selStr$$, $declStr$$, $mediaStr$$, $newStyleBoolean$$);
  }, $addDomLoadEvent$: $addDomLoadEvent$$, $addLoadEvent$: $addLoadEvent$$, $getQueryParamValue$: function($param$$3$$) {
    var $pairs_q$$ = $doc$$.location.search || $doc$$.location.hash;
    if ($pairs_q$$) {
      /\?/.test($pairs_q$$) && ($pairs_q$$ = $pairs_q$$.split('?')[1]);
      if ($param$$3$$ == $JSCompiler_alias_NULL$$) {
        return $urlEncodeIfNecessary$$($pairs_q$$);
      }
      for (var $pairs_q$$ = $pairs_q$$.split('&'), $i$$34$$ = 0; $i$$34$$ < $pairs_q$$.length; $i$$34$$++) {
        if ($pairs_q$$[$i$$34$$].substring(0, $pairs_q$$[$i$$34$$].indexOf('=')) == $param$$3$$) {
          return $urlEncodeIfNecessary$$($pairs_q$$[$i$$34$$].substring($pairs_q$$[$i$$34$$].indexOf('=') + 1));
        }
      }
    }
    return'';
  }, $expressInstallCallback$: function() {
    if ($isExpressInstallActive$$) {
      var $obj$$39$$ = $getElementById$$($EXPRESS_INSTALL_ID$$);
      $obj$$39$$ && $storedAltContent$$ && ($obj$$39$$.parentNode.replaceChild($storedAltContent$$, $obj$$39$$), $storedAltContentId$$ && ($setVisibility$$($storedAltContentId$$, $JSCompiler_alias_TRUE$$), $ua$$.$ie$ && $ua$$.$win$ && ($storedAltContent$$.style.display = 'block')), $storedCallbackFn$$ && $storedCallbackFn$$($storedCallbackObj$$));
      $isExpressInstallActive$$ = $JSCompiler_alias_FALSE$$;
    }
  }};
}();
function $Resampler$$($fromSampleRate$$, $toSampleRate$$, $channels$$1$$, $outputBufferSize$$, $noReturn$$) {
  this.$fromSampleRate$ = $fromSampleRate$$;
  this.$toSampleRate$ = $toSampleRate$$;
  this.$channels$ = $channels$$1$$ | 0;
  this.$outputBufferSize$ = $outputBufferSize$$;
  this.$noReturn$ = !!$noReturn$$;
  this.$initialize$();
}
$Resampler$$.prototype.$initialize$ = function $$Resampler$$$$$initialize$$() {
  if (0 < this.$fromSampleRate$ && 0 < this.$toSampleRate$ && 0 < this.$channels$) {
    if (this.$fromSampleRate$ == this.$toSampleRate$) {
      this.$resampler$ = this.$bypassResampler$, this.$ratioWeight$ = 1;
    }else {
      for (var $toCompile$$inline_29$$ = 'var bufferLength = Math.min(buffer.length, this.outputBufferSize);  if ((bufferLength % ' + this.$channels$ + ') == 0) {    if (bufferLength > 0) {      var ratioWeight = this.ratioWeight;      var weight = 0;', $channel$$inline_30$$ = 0; $channel$$inline_30$$ < this.$channels$; ++$channel$$inline_30$$) {
        $toCompile$$inline_29$$ += 'var output' + $channel$$inline_30$$ + ' = 0;';
      }
      $toCompile$$inline_29$$ += 'var actualPosition = 0;      var amountToNext = 0;      var alreadyProcessedTail = !this.tailExists;      this.tailExists = false;      var outputBuffer = this.outputBuffer;      var outputOffset = 0;      var currentPosition = 0;      do {        if (alreadyProcessedTail) {          weight = ratioWeight;';
      for ($channel$$inline_30$$ = 0; $channel$$inline_30$$ < this.$channels$; ++$channel$$inline_30$$) {
        $toCompile$$inline_29$$ += 'output' + $channel$$inline_30$$ + ' = 0;';
      }
      $toCompile$$inline_29$$ += '}        else {          weight = this.lastWeight;';
      for ($channel$$inline_30$$ = 0; $channel$$inline_30$$ < this.$channels$; ++$channel$$inline_30$$) {
        $toCompile$$inline_29$$ += 'output' + $channel$$inline_30$$ + ' = this.lastOutput[' + $channel$$inline_30$$ + '];';
      }
      $toCompile$$inline_29$$ += 'alreadyProcessedTail = true;        }        while (weight > 0 && actualPosition < bufferLength) {          amountToNext = 1 + actualPosition - currentPosition;          if (weight >= amountToNext) {';
      for ($channel$$inline_30$$ = 0; $channel$$inline_30$$ < this.$channels$; ++$channel$$inline_30$$) {
        $toCompile$$inline_29$$ += 'output' + $channel$$inline_30$$ + ' += buffer[actualPosition++] * amountToNext;';
      }
      $toCompile$$inline_29$$ += 'currentPosition = actualPosition;            weight -= amountToNext;          }          else {';
      for ($channel$$inline_30$$ = 0; $channel$$inline_30$$ < this.$channels$; ++$channel$$inline_30$$) {
        $toCompile$$inline_29$$ += 'output' + $channel$$inline_30$$ + ' += buffer[actualPosition' + (0 < $channel$$inline_30$$ ? ' + ' + $channel$$inline_30$$ : '') + '] * weight;';
      }
      $toCompile$$inline_29$$ += 'currentPosition += weight;            weight = 0;            break;          }        }        if (weight == 0) {';
      for ($channel$$inline_30$$ = 0; $channel$$inline_30$$ < this.$channels$; ++$channel$$inline_30$$) {
        $toCompile$$inline_29$$ += 'outputBuffer[outputOffset++] = output' + $channel$$inline_30$$ + ' / ratioWeight;';
      }
      $toCompile$$inline_29$$ += '}        else {          this.lastWeight = weight;';
      for ($channel$$inline_30$$ = 0; $channel$$inline_30$$ < this.$channels$; ++$channel$$inline_30$$) {
        $toCompile$$inline_29$$ += 'this.lastOutput[' + $channel$$inline_30$$ + '] = output' + $channel$$inline_30$$ + ';';
      }
      this.$resampler$ = this.$interpolate$ = Function('buffer', $toCompile$$inline_29$$ + 'this.tailExists = true;          break;        }      } while (actualPosition < bufferLength);      return this.bufferSlice(outputOffset);    }    else {      return (this.noReturn) ? 0 : [];    }  }  else {    throw(new Error("Buffer was of incorrect sample length."));  }');
      this.$ratioWeight$ = this.$fromSampleRate$ / this.$toSampleRate$;
      this.outputBuffer = $getFloat32$$(this.$outputBufferSize$);
      $getFloat32$$(this.$channels$);
    }
  }else {
    throw Error('Invalid settings specified for the resampler.');
  }
};
$Resampler$$.prototype.$bypassResampler$ = function $$Resampler$$$$$bypassResampler$$($buffer$$13$$) {
  return this.$noReturn$ ? (this.outputBuffer = $buffer$$13$$, $buffer$$13$$.length) : $buffer$$13$$;
};
function $XAudioServer$$($channels$$2$$, $sampleRate$$2$$, $minBufferSize$$, $maxBufferSize$$, $underRunCallback$$, $volume$$) {
  this.$audioChannels$ = 2 == $channels$$2$$ ? 2 : 1;
  $webAudioMono$$ = 1 == this.$audioChannels$;
  $XAudioJSSampleRate$$ = 0 < $sampleRate$$2$$ && 16777215 >= $sampleRate$$2$$ ? $sampleRate$$2$$ : 44100;
  $webAudioMinBufferSize$$ = $minBufferSize$$ >= $samplesPerCallback$$ << 1 && $minBufferSize$$ < $maxBufferSize$$ ? $minBufferSize$$ & ($webAudioMono$$ ? 4294967295 : 4294967294) : $samplesPerCallback$$ << 1;
  $webAudioMaxBufferSize$$ = Math.floor($maxBufferSize$$) > $webAudioMinBufferSize$$ + this.$audioChannels$ ? $maxBufferSize$$ & ($webAudioMono$$ ? 4294967295 : 4294967294) : $minBufferSize$$ << 1;
  this.$underRunCallback$ = 'function' == typeof $underRunCallback$$ ? $underRunCallback$$ : $JSCompiler_emptyFn$$();
  $XAudioJSVolume$$ = 0 <= $volume$$ && 1 >= $volume$$ ? $volume$$ : 1;
  this.$audioType$ = -1;
  this.$mozAudioTail$ = [];
  this.$audioHandleFlash$ = this.$audioHandleMoz$ = $JSCompiler_alias_NULL$$;
  this.$mozAudioFound$ = this.$flashInitialized$ = $JSCompiler_alias_FALSE$$;
  try {
    $JSCompiler_StaticMethods_preInitializeMozAudio$$(this);
    if ('Linux i686' == navigator.platform) {
      throw Error('');
    }
    $JSCompiler_StaticMethods_writeMozAudio$$(this, $getFloat32$$($webAudioMinBufferSize$$));
    this.$audioType$ = 0;
  }catch ($error1$$inline_35$$) {
    try {
      if ($launchedContext$$) {
        $resetCallbackAPIAudioBuffer$$($webAudioActualSampleRate$$), this.$audioType$ = 1;
      }else {
        throw Error('');
      }
    }catch ($error2$$inline_36$$) {
      try {
        $JSCompiler_StaticMethods_initializeFlashAudio$$(this);
      }catch ($error3$$inline_37$$) {
        throw Error('Browser does not support real time audio output.');
      }
    }
  }
}
function $JSCompiler_StaticMethods_callbackBasedWriteAudioNoCallback$$($buffer$$17$$) {
  for (var $length$$14$$ = $buffer$$17$$.length, $bufferCounter$$ = 0; $bufferCounter$$ < $length$$14$$ && $audioBufferSize$$ < $webAudioMaxBufferSize$$;) {
    $audioContextSampleBuffer$$[$audioBufferSize$$++] = $buffer$$17$$[$bufferCounter$$++];
  }
}
$XAudioServer$$.prototype.$writeAudio$ = function $$XAudioServer$$$$$writeAudio$$($buffer$$18$$) {
  0 == this.$audioType$ ? ($JSCompiler_StaticMethods_writeMozAudio$$(this, $buffer$$18$$), $JSCompiler_StaticMethods_MOZExecuteCallback$$(this)) : 1 == this.$audioType$ ? ($JSCompiler_StaticMethods_callbackBasedWriteAudioNoCallback$$($buffer$$18$$), $JSCompiler_StaticMethods_callbackBasedExecuteCallback$$(this)) : 2 == this.$audioType$ && ($JSCompiler_StaticMethods_checkFlashInit$$(this) || $launchedContext$$ ? ($JSCompiler_StaticMethods_callbackBasedWriteAudioNoCallback$$($buffer$$18$$), $JSCompiler_StaticMethods_callbackBasedExecuteCallback$$(this)) :
      this.$mozAudioFound$ && ($JSCompiler_StaticMethods_writeMozAudio$$(this, $buffer$$18$$), $JSCompiler_StaticMethods_MOZExecuteCallback$$(this)))
};
function $JSCompiler_StaticMethods_remainingBuffer$$($JSCompiler_StaticMethods_remainingBuffer$self$$) {
  if (0 == $JSCompiler_StaticMethods_remainingBuffer$self$$.$audioType$) {
    return $JSCompiler_StaticMethods_remainingBuffer$self$$.$samplesAlreadyWritten$ - $JSCompiler_StaticMethods_remainingBuffer$self$$.$audioHandleMoz$.mozCurrentSampleOffset();
  }
  if (1 == $JSCompiler_StaticMethods_remainingBuffer$self$$.$audioType$) {
    return ((($resampleBufferStart$$ <= $resampleBufferEnd$$ ? 0 : $resampleBufferSize$$) + $resampleBufferEnd$$ - $resampleBufferStart$$) * $resampleControl$$.$ratioWeight$ >> $JSCompiler_StaticMethods_remainingBuffer$self$$.$audioChannels$ - 1 << $JSCompiler_StaticMethods_remainingBuffer$self$$.$audioChannels$ - 1) + $audioBufferSize$$;
  }
  if (2 == $JSCompiler_StaticMethods_remainingBuffer$self$$.$audioType$) {
    if ($JSCompiler_StaticMethods_checkFlashInit$$($JSCompiler_StaticMethods_remainingBuffer$self$$) || $launchedContext$$) {
      return ((($resampleBufferStart$$ <= $resampleBufferEnd$$ ? 0 : $resampleBufferSize$$) + $resampleBufferEnd$$ - $resampleBufferStart$$) * $resampleControl$$.$ratioWeight$ >> $JSCompiler_StaticMethods_remainingBuffer$self$$.$audioChannels$ - 1 << $JSCompiler_StaticMethods_remainingBuffer$self$$.$audioChannels$ - 1) + $audioBufferSize$$;
    }
    if ($JSCompiler_StaticMethods_remainingBuffer$self$$.$mozAudioFound$) {
      return $JSCompiler_StaticMethods_remainingBuffer$self$$.$samplesAlreadyWritten$ - $JSCompiler_StaticMethods_remainingBuffer$self$$.$audioHandleMoz$.mozCurrentSampleOffset();
    }
  }
  return 0;
}
function $JSCompiler_StaticMethods_MOZExecuteCallback$$($JSCompiler_StaticMethods_MOZExecuteCallback$self$$) {
  var $samplesRequested$$ = $webAudioMinBufferSize$$ - $JSCompiler_StaticMethods_remainingBuffer$$($JSCompiler_StaticMethods_MOZExecuteCallback$self$$);
  0 < $samplesRequested$$ && $JSCompiler_StaticMethods_writeMozAudio$$($JSCompiler_StaticMethods_MOZExecuteCallback$self$$, $JSCompiler_StaticMethods_MOZExecuteCallback$self$$.$underRunCallback$($samplesRequested$$));
}
function $JSCompiler_StaticMethods_callbackBasedExecuteCallback$$($JSCompiler_StaticMethods_callbackBasedExecuteCallback$self$$) {
  var $samplesRequested$$1$$ = $webAudioMinBufferSize$$ - $JSCompiler_StaticMethods_remainingBuffer$$($JSCompiler_StaticMethods_callbackBasedExecuteCallback$self$$);
  0 < $samplesRequested$$1$$ && $JSCompiler_StaticMethods_callbackBasedWriteAudioNoCallback$$($JSCompiler_StaticMethods_callbackBasedExecuteCallback$self$$.$underRunCallback$($samplesRequested$$1$$));
}
function $JSCompiler_StaticMethods_preInitializeMozAudio$$($JSCompiler_StaticMethods_preInitializeMozAudio$self$$) {
  $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$audioHandleMoz$ = new Audio;
  $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$audioHandleMoz$.mozSetup($JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$audioChannels$, $XAudioJSSampleRate$$);
  $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$samplesAlreadyWritten$ = 0;
  var $emptySampleFrame$$ = 2 == $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$audioChannels$ ? $getFloat32$$(2) : $getFloat32$$(1), $prebufferAmount$$ = 0;
  if ('MacIntel' != navigator.platform && 'MacPPC' != navigator.platform) {
    for (; 0 == $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$audioHandleMoz$.mozCurrentSampleOffset();) {
      $prebufferAmount$$ += $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$audioHandleMoz$.mozWriteAudio($emptySampleFrame$$);
    }
    for (var $samplesToDoubleBuffer$$ = $prebufferAmount$$ / $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$audioChannels$, $index$$48$$ = 0; $index$$48$$ < $samplesToDoubleBuffer$$; $index$$48$$++) {
      $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$samplesAlreadyWritten$ += $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$audioHandleMoz$.mozWriteAudio($emptySampleFrame$$);
    }
  }
  $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$samplesAlreadyWritten$ += $prebufferAmount$$;
  $webAudioMinBufferSize$$ += $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$samplesAlreadyWritten$;
  $JSCompiler_StaticMethods_preInitializeMozAudio$self$$.$mozAudioFound$ = $JSCompiler_alias_TRUE$$;
}
function $JSCompiler_StaticMethods_initializeFlashAudio$$($JSCompiler_StaticMethods_initializeFlashAudio$self$$) {
  var $existingFlashload_mainContainerNode$$ = document.getElementById('XAudioJS');
  if ($existingFlashload_mainContainerNode$$ == $JSCompiler_alias_NULL$$) {
    $existingFlashload_mainContainerNode$$ = document.createElement('div');
    $existingFlashload_mainContainerNode$$.setAttribute('style', 'position: fixed; bottom: 0px; right: 0px; margin: 0px; padding: 0px; border: none; width: 8px; height: 8px; overflow: hidden; z-index: -1000; ');
    var $containerNode$$ = document.createElement('div');
    $containerNode$$.setAttribute('style', 'position: static; border: none; width: 0px; height: 0px; visibility: hidden; margin: 8px; padding: 0px;');
    $containerNode$$.setAttribute('id', 'XAudioJS');
    $existingFlashload_mainContainerNode$$.appendChild($containerNode$$);
    document.getElementsByTagName('body')[0].appendChild($existingFlashload_mainContainerNode$$);
    $swfobject$$.$embedSWF$('XAudioJS.swf', 'XAudioJS', '8', '8', '9.0.0', '', {}, {allowscriptaccess: 'always'}, {style: 'position: static; visibility: hidden; margin: 8px; padding: 0px; border: none'}, function($event$$3$$) {
      $event$$3$$.success ? $JSCompiler_StaticMethods_initializeFlashAudio$self$$.$audioHandleFlash$ = $event$$3$$.$ref$ : $JSCompiler_StaticMethods_initializeFlashAudio$self$$.$audioType$ = 1;
    });
  }else {
    $JSCompiler_StaticMethods_initializeFlashAudio$self$$.$audioHandleFlash$ = $existingFlashload_mainContainerNode$$;
  }
  $JSCompiler_StaticMethods_initializeFlashAudio$self$$.$audioType$ = 2;
}
function $JSCompiler_StaticMethods_writeMozAudio$$($JSCompiler_StaticMethods_writeMozAudio$self$$, $buffer$$20$$) {
  var $length$$15$$ = $JSCompiler_StaticMethods_writeMozAudio$self$$.$mozAudioTail$.length;
  if (0 < $length$$15$$) {
    var $samplesAccepted$$ = $JSCompiler_StaticMethods_writeMozAudio$self$$.$audioHandleMoz$.mozWriteAudio($JSCompiler_StaticMethods_writeMozAudio$self$$.$mozAudioTail$);
    $JSCompiler_StaticMethods_writeMozAudio$self$$.$samplesAlreadyWritten$ += $samplesAccepted$$;
    $JSCompiler_StaticMethods_writeMozAudio$self$$.$mozAudioTail$.splice(0, $samplesAccepted$$);
  }
  $length$$15$$ = Math.min($buffer$$20$$.length, $webAudioMaxBufferSize$$ - $JSCompiler_StaticMethods_writeMozAudio$self$$.$samplesAlreadyWritten$ + $JSCompiler_StaticMethods_writeMozAudio$self$$.$audioHandleMoz$.mozCurrentSampleOffset());
  $samplesAccepted$$ = $JSCompiler_StaticMethods_writeMozAudio$self$$.$audioHandleMoz$.mozWriteAudio($buffer$$20$$);
  $JSCompiler_StaticMethods_writeMozAudio$self$$.$samplesAlreadyWritten$ += $samplesAccepted$$;
  for (var $index$$49$$ = 0; $length$$15$$ > $samplesAccepted$$; --$length$$15$$) {
    $JSCompiler_StaticMethods_writeMozAudio$self$$.$mozAudioTail$.push($buffer$$20$$[$index$$49$$++]);
  }
}
function $JSCompiler_StaticMethods_checkFlashInit$$($JSCompiler_StaticMethods_checkFlashInit$self$$) {
  !$JSCompiler_StaticMethods_checkFlashInit$self$$.$flashInitialized$ && ($JSCompiler_StaticMethods_checkFlashInit$self$$.$audioHandleFlash$ && $JSCompiler_StaticMethods_checkFlashInit$self$$.$audioHandleFlash$.$initialize$) && ($JSCompiler_StaticMethods_checkFlashInit$self$$.$flashInitialized$ = $JSCompiler_alias_TRUE$$, $JSCompiler_StaticMethods_checkFlashInit$self$$.$audioHandleFlash$.$initialize$(), $resetCallbackAPIAudioBuffer$$(44100));
  return $JSCompiler_StaticMethods_checkFlashInit$self$$.$flashInitialized$;
}
function $getFloat32$$($size$$11$$) {
  try {
    return new Float32Array($size$$11$$);
  }catch ($error$$3$$) {
    return Array($size$$11$$);
  }
}
function $getFloat32Flat$$() {
  var $size$$12$$ = $resampleBufferSize$$;
  try {
    var $newBuffer$$ = new Float32Array($size$$12$$);
  }catch ($error$$4$$) {
    var $newBuffer$$ = Array($size$$12$$), $audioSampleIndice$$ = 0;
    do {
      $newBuffer$$[$audioSampleIndice$$] = 0;
    }while (++$audioSampleIndice$$ < $size$$12$$);
  }
  return $newBuffer$$;
}
var $samplesPerCallback$$ = 2048, $audioContextHandle$$ = $JSCompiler_alias_NULL$$, $audioNode$$ = $JSCompiler_alias_NULL$$, $audioSource$$ = $JSCompiler_alias_NULL$$, $launchedContext$$ = $JSCompiler_alias_FALSE$$, $audioContextSampleBuffer$$ = [], $resampled$$ = [], $webAudioMinBufferSize$$ = 15E3, $webAudioMaxBufferSize$$ = 25E3, $webAudioActualSampleRate$$ = 44100, $XAudioJSSampleRate$$ = 0, $webAudioMono$$ = $JSCompiler_alias_FALSE$$, $XAudioJSVolume$$ = 1, $resampleControl$$ = $JSCompiler_alias_NULL$$,
    $audioBufferSize$$ = 0, $resampleBufferStart$$ = 0, $resampleBufferEnd$$ = 0, $resampleBufferSize$$ = 2;
function $audioOutputEvent$$($buffer2_event$$4$$) {
  var $index$$52$$ = 0, $buffer1$$ = $buffer2_event$$4$$.outputBuffer.getChannelData(0), $buffer2_event$$4$$ = $buffer2_event$$4$$.outputBuffer.getChannelData(1);
  if (0 < $audioBufferSize$$) {
    for (var $resampleLength$$inline_60$$ = $resampleControl$$.$resampler$($getBufferSamples$$()), $resampledResult$$inline_61$$ = $resampleControl$$.outputBuffer, $index2$$inline_62$$ = 0; $index2$$inline_62$$ < $resampleLength$$inline_60$$; ++$index2$$inline_62$$) {
      $resampled$$[$resampleBufferEnd$$++] = $resampledResult$$inline_61$$[$index2$$inline_62$$], $resampleBufferEnd$$ == $resampleBufferSize$$ && ($resampleBufferEnd$$ = 0), $resampleBufferStart$$ == $resampleBufferEnd$$ && (++$resampleBufferStart$$, $resampleBufferStart$$ == $resampleBufferSize$$ && ($resampleBufferStart$$ = 0));
    }
    $audioBufferSize$$ = 0;
  }
  if ($webAudioMono$$) {
    for (; $index$$52$$ < $samplesPerCallback$$ && $resampleBufferStart$$ != $resampleBufferEnd$$;) {
      $buffer2_event$$4$$[$index$$52$$] = $buffer1$$[$index$$52$$] = $resampled$$[$resampleBufferStart$$++] * $XAudioJSVolume$$, ++$index$$52$$, $resampleBufferStart$$ == $resampleBufferSize$$ && ($resampleBufferStart$$ = 0);
    }
  }else {
    for (; $index$$52$$ < $samplesPerCallback$$ && $resampleBufferStart$$ != $resampleBufferEnd$$;) {
      $buffer1$$[$index$$52$$] = $resampled$$[$resampleBufferStart$$++] * $XAudioJSVolume$$, $buffer2_event$$4$$[$index$$52$$++] = $resampled$$[$resampleBufferStart$$++] * $XAudioJSVolume$$, $resampleBufferStart$$ == $resampleBufferSize$$ && ($resampleBufferStart$$ = 0);
    }
  }
  for (; $index$$52$$ < $samplesPerCallback$$;) {
    $buffer2_event$$4$$[$index$$52$$] = $buffer1$$[$index$$52$$] = 0, ++$index$$52$$;
  }
}
function $getBufferSamples$$() {
  try {
    return $audioContextSampleBuffer$$.subarray(0, $audioBufferSize$$);
  }catch ($error1$$2$$) {
    try {
      return $audioContextSampleBuffer$$.length = $audioBufferSize$$, $audioContextSampleBuffer$$;
    }catch ($error2$$2$$) {
      return $audioContextSampleBuffer$$.slice(0, $audioBufferSize$$);
    }
  }
}
function $resetCallbackAPIAudioBuffer$$($APISampleRate$$) {
  $audioContextSampleBuffer$$ = $getFloat32$$($webAudioMaxBufferSize$$);
  $audioBufferSize$$ = $webAudioMaxBufferSize$$;
  $resampleBufferEnd$$ = $resampleBufferStart$$ = 0;
  $resampleBufferSize$$ = Math.max($webAudioMaxBufferSize$$ * Math.ceil($XAudioJSSampleRate$$ / $APISampleRate$$), $samplesPerCallback$$) << 1;
  $webAudioMono$$ ? ($resampled$$ = $getFloat32Flat$$(), $resampleControl$$ = new $Resampler$$($XAudioJSSampleRate$$, $APISampleRate$$, 1, $resampleBufferSize$$, $JSCompiler_alias_TRUE$$)) : ($resampleBufferSize$$ <<= 1, $resampled$$ = $getFloat32Flat$$(), $resampleControl$$ = new $Resampler$$($XAudioJSSampleRate$$, $APISampleRate$$, 2, $resampleBufferSize$$, $JSCompiler_alias_TRUE$$));
}
a: {
  if (!$launchedContext$$) {
    try {
      $audioContextHandle$$ = new webkitAudioContext;
    }catch ($error1$$inline_64$$) {
      try {
        $audioContextHandle$$ = new AudioContext;
      }catch ($error2$$inline_65$$) {
        break a;
      }
    }
    try {
      $audioSource$$ = $audioContextHandle$$.createBufferSource(), $audioSource$$.loop = $JSCompiler_alias_FALSE$$, $XAudioJSSampleRate$$ = $webAudioActualSampleRate$$ = $audioContextHandle$$.sampleRate, $audioSource$$.buffer = $audioContextHandle$$.createBuffer(1, 1, $webAudioActualSampleRate$$), $audioNode$$ = $audioContextHandle$$.createJavaScriptNode($samplesPerCallback$$, 1, 2), $audioNode$$.onaudioprocess = $audioOutputEvent$$, $audioSource$$.connect($audioNode$$), $audioNode$$.connect($audioContextHandle$$.destination),
      $audioSource$$.noteOn(0);
    }catch ($error$$inline_66$$) {
      break a;
    }
    $launchedContext$$ = $JSCompiler_alias_TRUE$$;
  }
};
window.JSSMS = $JSSMS$$;
jQuery.fn.JSSMSUI = jQuery.fn.$JSSMSUI$;

