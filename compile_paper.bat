@echo off
echo Cleaning...
del *.aux *.log *.bbl *.blg *.out *.toc *.synctex.gz
echo.
echo Running pdflatex (1/3)...
pdflatex -interaction=nonstopmode research_paper
echo.
echo Running bibtex...
bibtex research_paper
echo.
echo Running pdflatex (2/3)...
pdflatex -interaction=nonstopmode research_paper
echo.
echo Running pdflatex (3/3)...
pdflatex -interaction=nonstopmode research_paper
echo.
echo Done! check research_paper.pdf
pause
