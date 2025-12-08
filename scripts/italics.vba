Sub EncloseItalicWithTags_AllSheets()
    Dim ws As Worksheet
    Dim cell As Range
    Dim i As Long
    Dim newText As String
    Dim inItalic As Boolean
    
    For Each ws In ThisWorkbook.Worksheets
        For Each cell In ws.UsedRange
            If Not IsEmpty(cell.Value) Then
                newText = ""
                inItalic = False
                
                For i = 1 To Len(cell.Value)
                    With cell.Characters(Start:=i, Length:=1).Font
                        If .Italic And Not inItalic Then
                            newText = newText & "<i>" & Mid(cell.Value, i, 1)
                            inItalic = True
                        ElseIf Not .Italic And inItalic Then
                            newText = newText & "</i>" & Mid(cell.Value, i, 1)
                            inItalic = False
                        Else
                            newText = newText & Mid(cell.Value, i, 1)
                        End If
                    End With
                Next i
                
                ' Close tag if still italic at the end
                If inItalic Then newText = newText & "</i>"
                
                cell.Value = newText
            End If
        Next cell
    Next ws
End Sub