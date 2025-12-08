import xlwings as xw

app = xw.App(visible=True)
print("app.impl:", app.impl)  # Should show a PyWin32 COM objectj