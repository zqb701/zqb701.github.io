const QUOTA_DAILY =  120		'每天配給
const INTERVAL = 3					'間隔時間
stay = 	5									'停留時間
regActTime = "1/1/1990"

set xshell = CreateObject("WScript.Shell")
'讀取最近使用日期
on error resume next
regActTime= xshell.RegRead("HKCU\SOFTWARE\zqb\usingtime\actionTime")	'根機碼可以縮寫
on error goto 0

actTime = Now
actQuota = QUOTA_DAILY
'若日期值空白, 或不是今天
if regActTime = "1/1/1990" OR datevalue(regActTime) <> date then		'
	regActTime = month(actTime)& "/" & day(actTime) & "/" & year(actTime) & " " & formatDateTime(actTime,4)
'則日期重置
	xshell.RegWrite "HKCU\SOFTWARE\zqb\usingtime\actionTime", regActTime		' 預設形態為"REG_SZ"	
'及額度重置
	xshell.RegWrite "HKCU\SOFTWARE\zqb\usingtime\minuteQuotaDaily", QUOTA_DAILY, "REG_DWORD"	'含路徑都可一併建立, 三個參數都要
else
'否則取得最近時間
	actTime = CDate(regActTime)
	
	on error resume next
	regQuota = xshell.RegRead("HKCU\SOFTWARE\zqb\usingtime\minuteQuotaDaily")	'根機碼可以縮寫
	on error goto 0

	if regQuota = "" then 
		xshell.RegWrite "HKCU\SOFTWARE\zqb\usingtime\minuteQuotaDaily", QUOTA_DAILY, "REG_DWORD"	'含路徑都可一併建立, 三個參數都要
	else
'取得剩餘額度
		actQuota = CInt(regQuota)
	end if
end if
'檢查間隔時間是否滿足
intervaltmp = DateDiff("n", actTime, Now )
if  intervaltmp <  INTERVAL then
	xshell.Popup "間隔時間" & intervaltmp & "分鐘, 未滿" & INTERVAL & "分鐘", 10, "訊息", 4096
	'CreateObject("WScript.Shell").run "shutdown /l /f"	'登出
	WScript.quit()
end if

xshell.Popup "可用" & stay & "分鐘, 餘額" & actQuota &"分鐘。", 10, "訊息", 4096
for min= stay to 1 step -1
'每隔60秒記錄一次
	WScript.Sleep 60*1000
	actQuota = actQuota - 1
'寫入餘額
	xshell.RegWrite "HKCU\SOFTWARE\zqb\usingtime\minuteQuotaDaily", actQuota, "REG_DWORD"	'含路徑都可一併建立, 三個參數都要
'寫入時間
	actTime = Now
	regActTime = month(actTime)& "/" & day(actTime) & "/" & year(actTime) & " " & formatDateTime(actTime,4)
	xshell.RegWrite "HKCU\SOFTWARE\zqb\usingtime\actionTime", regActTime		' 預設形態為"REG_SZ"	
'直到停留時間扣完
next

xshell.Popup "時間到, 將登出。", 10, "訊息", 4096
'CreateObject("WScript.Shell").run "shutdown /l /f"	'登出
WScript.quit()