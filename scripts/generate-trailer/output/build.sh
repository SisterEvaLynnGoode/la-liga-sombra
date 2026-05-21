#!/bin/bash
set -e
cd "$(dirname "$0")"

FONT_BOLD="C:/Windows/Fonts/arialbd.ttf"
FONT_REG="C:/Windows/Fonts/arial.ttf"

ffmpeg -y \
  -i shot-01.mp4 -i shot-02.mp4 -i shot-03.mp4 -i shot-04.mp4 -i shot-05.mp4 \
  -i shot-06.mp4 -i shot-07.mp4 -i shot-08.mp4 -i shot-09.mp4 \
  -filter_complex "
    [0:v]trim=0:5,setpts=PTS-STARTPTS[v0];
    [1:v]trim=0:5,setpts=PTS-STARTPTS[v1];
    [2:v]trim=0:5,setpts=PTS-STARTPTS[v2];
    [3:v]trim=0:5,setpts=PTS-STARTPTS[v3];
    [4:v]trim=0:5,setpts=PTS-STARTPTS[v4];
    [5:v]trim=0:4,setpts=PTS-STARTPTS[v5];
    [6:v]trim=0:3,setpts=PTS-STARTPTS[v6];
    [7:v]trim=0:1.5,setpts=PTS-STARTPTS[v7];
    [8:v]trim=0:1.5,setpts=PTS-STARTPTS[v8];
    [v0][v1]xfade=transition=fade:duration=0.5:offset=4.5[xf01];
    [xf01][v2]xfade=transition=fade:duration=0:offset=9[xf02];
    [xf02][v3]xfade=transition=fade:duration=0:offset=14[xf03];
    [xf03][v4]xfade=transition=fade:duration=0:offset=19[xf04];
    [xf04][v5]xfade=transition=fade:duration=0.5:offset=23.5[xf05];
    [xf05][v6]xfade=transition=fade:duration=0:offset=27.5[xf06];
    [xf06][v7]xfade=transition=fade:duration=0:offset=30.5[xf07];
    [xf07][v8]xfade=transition=fade:duration=0:offset=32[xf08];
    [xf08]drawtext=text='LA LIGA SOMBRA':fontsize=80:fontcolor=#C9933A:x=(w-text_w)/2:y=(h/2-80):enable='between(t,10,15)':alpha='if(lt(t\,10.5)\,2*(t-10)\,1)':fontfile='$FONT_BOLD'[dt1];
    [dt1]drawtext=text='Un misterio en espanol':fontsize=40:fontcolor=#C0392B:x=(w-text_w)/2:y=(h/2+10):enable='between(t,13,15)':alpha='if(lt(t\,13.5)\,2*(t-13)\,1)':fontfile='$FONT_REG'[dt2];
    [dt2]drawtext=text='JUSTICIA':fontsize=100:fontcolor=#C0392B:x=(w-text_w)/2:y=h*0.7:enable='between(t,33.5,35)':alpha='if(lt(t\,34)\,2*(t-33.5)\,1)':fontfile='$FONT_BOLD'[dt3];
    [dt3]drawtext=text='Puedes atraparlos?':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=h*0.83:enable='between(t,34,35)':alpha='if(lt(t\,34.5)\,2*(t-34)\,1)':fontfile='$FONT_REG'[dt4];
    [dt4]fade=t=out:st=34.5:d=0.5[vout]
  " \
  -map "[vout]" \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -an \
  la-liga-sombra-trailer.mp4
